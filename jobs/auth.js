const FormData = require('form-data');
const { default: axios } = require('axios');

(async () => {
    const formData = new FormData();
    formData.append('email', process.env.AUGMONT_EMAIL);
    formData.append('password', process.env.AUGMONT_PASSWORD);

    try {
        const response = await axios.post(
            `${process.env.AUGMONT_URL}/merchant/v1/auth/login`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/json',
                    ...formData.getHeaders()
                },
                validateStatus: (status) => status < 500,
            }
        );

        if (response.status === 200) {
            process.env.augmontToken = response.data.result.data.accessToken;
        } else console.log(response.data);
    } catch (error) {
        console.log('AuthJob:', error);
    }
})();
