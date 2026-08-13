<?php
require 'test_gapfill.php';
echo "Result of /api/v1/admin/projects?search=undefined:\n";
echo request('GET', '/api/v1/admin/projects?search=undefined', $adminToken) . "\n\n";
echo "Result of /api/v1/admin/projects?search=null:\n";
echo request('GET', '/api/v1/admin/projects?search=null', $adminToken) . "\n\n";
echo "Result of /api/v1/admin/projects?status=undefined:\n";
echo request('GET', '/api/v1/admin/projects?status=undefined', $adminToken) . "\n\n";
