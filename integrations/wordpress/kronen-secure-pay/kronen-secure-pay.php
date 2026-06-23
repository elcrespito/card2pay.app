<?php
/**
 * Plugin Name: Kronen Secure Pay
 * Description: Secure card and crypto checkout for Kronen Peptide via Card2pay (hosted payment page).
 * Version: 1.0.0
 * Author: Kronen Peptide
 * Requires Plugins: woocommerce
 *
 * Backend: Card2pay gateway (dev.card2pay.app / card2pay.app)
 * Hash + signature scheme matches src/lib/gateway.ts in the Card2pay platform.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('plugins_loaded', 'kronen_secure_pay_init');

function kronen_secure_pay_init()
{
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    class WC_Gateway_Kronen_Secure_Pay extends WC_Payment_Gateway
    {
        public function __construct()
        {
            $this->id                 = 'kronen_secure_pay';
            $this->method_title       = 'Kronen Secure Pay';
            $this->method_description = 'Redirects customers to the Kronen secure payment page (card or crypto).';
            $this->has_fields         = false;

            $this->init_form_fields();
            $this->init_settings();

            $this->title        = $this->get_option('title', 'Sichere Online-Zahlung');
            $this->description = $this->get_option(
                'description',
                'Bezahlen Sie sicher mit Karte oder Krypto. Sie werden zu unserer geschützten Zahlungsseite weitergeleitet.'
            );
            $this->base_url     = rtrim($this->get_option('base_url'), '/');
            $this->api_key      = $this->get_option('api_key');
            $this->api_secret   = $this->get_option('api_secret');

            add_action(
                'woocommerce_update_options_payment_gateways_' . $this->id,
                array($this, 'process_admin_options')
            );
        }

        public function init_form_fields()
        {
            $this->form_fields = array(
                'enabled'      => array(
                    'title'   => 'Enable/Disable',
                    'type'    => 'checkbox',
                    'label'   => 'Enable Kronen Secure Pay',
                    'default' => 'no',
                ),
                'title'        => array(
                    'title'       => 'Checkout title',
                    'type'        => 'text',
                    'description' => 'Shown to customers at checkout.',
                    'default'     => 'Sichere Online-Zahlung',
                ),
                'description'  => array(
                    'title'   => 'Checkout description',
                    'type'    => 'textarea',
                    'default' => 'Bezahlen Sie sicher mit Karte oder Krypto. Sie werden zu unserer geschützten Zahlungsseite weitergeleitet.',
                ),
                'base_url'     => array(
                    'title'       => 'Payment platform URL',
                    'type'        => 'text',
                    'description' => 'Test: https://dev.card2pay.app — Live: https://card2pay.app',
                    'default'     => 'https://dev.card2pay.app',
                ),
                'api_key'      => array(
                    'title'       => 'API key',
                    'type'        => 'text',
                    'description' => 'From Card2pay dashboard → Integrations (starts with c2p_).',
                ),
                'api_secret'   => array(
                    'title'       => 'API secret',
                    'type'        => 'password',
                    'description' => 'Keep secret. Signs orders and verifies payment callbacks.',
                ),
                'webhook_info' => array(
                    'title'       => 'Webhook URL',
                    'type'        => 'title',
                    'description' => 'The payment platform POSTs here when payment is confirmed:<br><code>' . esc_html(rest_url('kronen-pay/v1/callback')) . '</code>',
                ),
            );
        }

        public function process_payment($order_id)
        {
            $order = wc_get_order($order_id);

            $payload = array(
                'order_id'     => (string) $order_id,
                'amount'       => (float) $order->get_total(),
                'currency'     => $order->get_currency(),
                'description'  => 'Kronen order ' . $order->get_order_number(),
                'email'        => $order->get_billing_email(),
                'return_url'   => $this->get_return_url($order),
                'callback_url' => rest_url('kronen-pay/v1/callback'),
                'ts'           => round(microtime(true) * 1000),
            );

            $hash = $this->encode_hash($payload);
            if (is_wp_error($hash)) {
                wc_add_notice('Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es erneut.', 'error');
                return array('result' => 'failure');
            }

            $order->update_status('pending', 'Awaiting Kronen Secure Pay.');

            return array(
                'result'   => 'success',
                'redirect' => $this->base_url . '/pay/h/' . $hash,
            );
        }

        private function b64url($bin)
        {
            return rtrim(strtr(base64_encode($bin), '+/', '-_'), '=');
        }

        private function encode_hash($payload)
        {
            if (empty($this->api_key) || empty($this->api_secret) || empty($this->base_url)) {
                return new WP_Error('kronen_pay_config', 'Kronen Secure Pay is not configured.');
            }
            $key = hash('sha256', $this->api_secret, true);
            $iv  = random_bytes(12);
            $tag = '';
            $ciphertext = openssl_encrypt(
                wp_json_encode($payload),
                'aes-256-gcm',
                $key,
                OPENSSL_RAW_DATA,
                $iv,
                $tag,
                $this->api_key,
                16
            );
            if ($ciphertext === false) {
                return new WP_Error('kronen_pay_encrypt', 'Encryption failed.');
            }
            return implode('.', array(
                'c2p1',
                $this->api_key,
                $this->b64url($iv),
                $this->b64url($ciphertext),
                $this->b64url($tag),
            ));
        }
    }

    add_filter('woocommerce_payment_gateways', function ($gateways) {
        $gateways[] = 'WC_Gateway_Kronen_Secure_Pay';
        return $gateways;
    });
}

add_action('rest_api_init', function () {
    register_rest_route('kronen-pay/v1', '/callback', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'kronen_secure_pay_handle_callback',
    ));
});

function kronen_secure_pay_handle_callback(WP_REST_Request $request)
{
    $raw       = $request->get_body();
    $signature = $request->get_header('x-card2pay-signature');

    $settings = get_option('woocommerce_kronen_secure_pay_settings', array());
    $secret   = isset($settings['api_secret']) ? $settings['api_secret'] : '';
    if (empty($secret)) {
        return new WP_REST_Response('not configured', 503);
    }

    $expected = hash_hmac('sha256', $raw, $secret);
    $given    = preg_replace('/^sha256=/', '', (string) $signature);
    if (!hash_equals($expected, $given)) {
        return new WP_REST_Response('invalid signature', 401);
    }

    $data = json_decode($raw, true);
    if (!is_array($data) || empty($data['order_id'])) {
        return new WP_REST_Response('bad payload', 400);
    }

    $order = wc_get_order($data['order_id']);
    if (!$order) {
        return new WP_REST_Response('order not found', 404);
    }

    if (($data['status'] ?? '') === 'paid' && !$order->is_paid()) {
        $txn = isset($data['reference']) ? (string) $data['reference'] : '';
        $order->payment_complete($txn);
        $order->add_order_note(
            'Kronen Secure Pay: Zahlung bestätigt' . ($txn ? ' (' . $txn . ')' : '') . '.'
        );
    }

    return new WP_REST_Response('ok', 200);
}
