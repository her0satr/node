<?php
class CURL {
	var $callback = false;

	function setCallback($func_name) {
		$this->callback = $func_name;
	}

	function doRequest($method, $url, $vars, $referer_address) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_REFERER, $referer_address);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		if ($method == 'POST') {
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $vars);
		}
		$data = curl_exec($ch);
		curl_close($ch);
		if ($data) {
			if ($this->callback) {
				$callback = $this->callback;
				$this->callback = false;
				return call_user_func($callback, $data);
			} else {
				return $data;
			}
		} else {
			if
			(is_resource($ch))
				return curl_error($ch);
			else
				return false;
		}
	}

	function get($url, $referer_address = '') {
		return $this->doRequest('GET', $url, 'NULL', $referer_address);
	}
	
	function post($url, $vars, $referer_address = '') {
		return $this->doRequest('POST', $url, $vars, $referer_address);
	}
}

	$curl = new CURL();
	$result = $curl->post('http://localhost:8080/', array( 'shortcode' => '50|30' ));
	print_r($result); exit;
	