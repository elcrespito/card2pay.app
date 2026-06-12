<?php
/**
 * Plugin Name: Card2pay for WooCommerce
 * Description: Accept payments via Card2pay. Sends a signed/encrypted order hash to the Card2pay hosted checkout and marks the order paid on the signed callback.
 * Version: 1.0.0
 * Author: Card2pay
 * Requires Plugins: woocommerce
 *
 * Hash + signature scheme must match src/lib/gateway.ts in the Card2pay app:
 *   - Hash: "c2p1.<apiKey>.<b64url(iv)>.<b64url(ciphertext)>.<b64url(tag)>"
 *   - AES-256-GCM, key = SHA-256(apiSecret) (raw bytes), 12-byte IV, AAD = apiKey
 *   - Callback signature: HMAC-SHA256(rawBody, apiSecret), header X-Card2pay-Signature
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('plugins_loaded', 'card2pay_init_gateway');

function card2pay_init_gateway()
{
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    class WC_Gateway_Card2pay extends WC_Payment_Gateway
    {
        public function __construct()
        {
            $this->id                 = 'card2pay';
            $this->method_title       = 'Card2pay';
            $this->method_description = 'Crypto & card-to-crypto checkout via Card2pay.';
            $this->has_fields         = false;

            $this->init_form_fields();
            $this->init_settings();

            $this->title       = $this->get_option('title', 'Card2pay');
            $this->description  = $this->get_option('description', 'Pay securely via Card2pay.');
            $this->base_url     = rtrim($this->get_option('base_url'), '/');
            $this->api_key      = $this->get_option('api_key');
            $this->api_secret   = $this->get_option('api_secret');

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
        }

        public function init_form_fields()
        {
            $this->form_fields = array(
                'enabled'     => array(
                    'title'   => 'Enable/Disable',
                    'type'    => 'checkbox',
                    'label'   => 'Enable Card2pay',
                    'default' => 'no',
                ),
                'title'       => array(
                    'title'   => 'Title',
                    'type'    => 'text',
                    'default' => 'Card2pay',
                ),
                'description' => array(
                    'title'   => 'Description',
                    'type'    => 'textarea',
                    'default' => 'Pay securely via Card2pay (crypto or card-to-crypto).',
                ),
                'base_url'    => array(
                    'title'       => 'Card2pay URL',
                    'type'        => 'text',
                    'description' => 'e.g. https://card2pay.app (or your test URL).',
                    'default'     => '',
                ),
                'api_key'     => array(
                    'title' => 'API key',
                    'type'  => 'text',
                ),
                'api_secret'  => array(
                    'title' => 'API secret',
                    'type'  => 'password',
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
                'description'  => 'Order ' . $order->get_order_number(),
                'email'        => $order->get_billing_email(),
                'return_url'   => $this->get_return_url($order),
                'callback_url' => rest_url('card2pay/v1/callback'),
                'ts'           => round(microtime(true) * 1000),
            );

            $hash = $this->encode_hash($payload);
            if (is_wp_error($hash)) {
                wc_add_notice('Payment error: could not initialise Card2pay.', 'error');
                return array('result' => 'failure');
            }

            $order->update_status('pending', 'Awaiting Card2pay payment.');

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
                return new WP_Error('card2pay_config', 'Card2pay not configured.');
            }
            $key = hash('sha256', $this->api_secret, true); // 32 raw bytes
            $iv  = random_bytes(12);
            $tag = '';
            $ciphertext = openssl_encrypt(
                wp_json_encode($payload),
                'aes-256-gcm',
                $key,
                OPENSSL_RAW_DATA,
                $iv,
                $tag,
                $this->api_key, // AAD
                16
            );
            if ($ciphertext === false) {
                return new WP_Error('card2pay_encrypt', 'Encryption failed.');
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
        $gateways[] = 'WC_Gateway_Card2pay';
        return $gateways;
    });
}

// ---- Inbound callback: mark the order paid -------------------------------

add_action('rest_api_init', function () {
    register_rest_route('card2pay/v1', '/callback', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'card2pay_handle_callback',
    ));
});

function card2pay_handle_callback(WP_REST_Request $request)
{
    $raw       = $request->get_body();
    $signature = $request->get_header('x-card2pay-signature');

    $settings = get_option('woocommerce_card2pay_settings', array());
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
        $order->payment_complete(isset($data['reference']) ? $data['reference'] : '');
        $order->add_order_note('Card2pay confirmed payment ' . ($data['reference'] ?? ''));
    }

    return new WP_REST_Response('ok', 200);
}
