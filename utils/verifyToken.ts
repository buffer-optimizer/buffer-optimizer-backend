import jwt from 'jsonwebtoken';

/**
 * @author Kingsley Baah Brew <kingsleybrew@gmail.com>
 * @return any
 * @todo Its verifies token
 */
// Define types for the return structure of the function
interface VerifyTokenResponse {
    state: boolean;
    data: any;
}

const verifyToken = async (token: string, secret: string): Promise<VerifyTokenResponse> => {
    try {
        const decoded = await new Promise<any>((resolve, reject) => {
            jwt.verify(token, secret, (err, user) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });

        return { state: true, data: decoded };
    } catch (err) {
        return { state: false, data: err };
    }
};

export default verifyToken;