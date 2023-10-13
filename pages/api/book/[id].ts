import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from 'utils/dbConnect';
import Book, { SerializedBookType } from 'models/book';

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void | NextApiResponse<SerializedBookType>>  => {
    if (req.method === 'GET') {
        await dbConnect();
        try {
            const { isLean, id } = req.query;

            const data: SerializedBookType = isLean
                ? await Book.findById(id)
                    .populate(`reviews.user`, `username discord_id image discriminator`)
                    .lean()
                : await Book.findById(id).populate(
                    `reviews.user`,
                    `username discord_id image discriminator`
                );

            return res.status(200).json(data);
        } catch (err) {
            return res.status(500).json({ message: 'Could not find book' });
        }
    }
    else {
        return res.status(405).json({message: "Method not supported"});
    }
}

export default handler;