<?php
$adminToken = '8|PksVRL8LkxKERsRoskTns5htCoQvXwDAVtC6mj4M45c78175';
function request($url) {
    global $adminToken;
    $ch = curl_init("http://localhost:8001$url");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $adminToken", "Accept: application/json"]);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}
echo "Normal:\n" . request('/api/v1/admin/projects') . "\n";
echo "Search=undefined:\n" . request('/api/v1/admin/projects?search=undefined') . "\n";
echo "Search=null:\n" . request('/api/v1/admin/projects?search=null') . "\n";
