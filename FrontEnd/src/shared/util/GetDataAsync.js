export default async function GetDataAsync(url, requestType, data) {
    try {
        const response = await fetch(url, {
            method: requestType || 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (requestType && requestType !== 'GET') {
            response.body = data;
        }
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong.');
        }
        return responseData;
    } catch (err) {
        throw err;
    }
};