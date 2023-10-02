import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse,
) {
    if (request.method === "GET") {
        cacheResults();
        response.status(200).json({
            status: "OK"
        });
        return;
    }
    return response.status(405).json({ message: "Method not supported" });
}

const cacheResults = () => {
    // Revalidate every 10 minutes
    const options = { next: { revalidate: 600 } }
    fetch(`${process.env.NEXT_PUBLIC_APP_URI}/api/movie`, options);
    fetch(`${process.env.NEXT_PUBLIC_APP_URI}/api/restaurant`, options);
}