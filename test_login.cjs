const axios = require('axios');
async function test() {
    try {
        const res = await axios.post('http://127.0.0.1:8001/api/v1/login', {
            email: 'admin@taskforge.com',
            password: 'Admin@123'
        });
        console.log("LOGIN SUCCESS: ", res.data.user.role);
    } catch(e) {
        console.log("LOGIN FAILED: ", e.response?.data || e.message);
    }
}
test();
