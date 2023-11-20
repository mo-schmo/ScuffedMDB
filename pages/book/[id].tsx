import { GetServerSidePropsContext } from 'next';
import { PopulatedUserType } from 'models/user';
import { Session } from 'next-auth';
import { getSession, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { getBook } from '../../utils/queries';
import { useQuery, dehydrate, QueryClient } from '@tanstack/react-query';
import ErrorPage from '@components/ErrorPage';
import AppLayout from '@components/AppLayout';
import RestaurantDetails from '@components/RestaurantDetails';
import { NextSeo } from 'next-seo';
import ReviewModal from '@components/ReviewModal';
import ReviewSection from '@components/ReviewSection/ReviewSection';
import { ReviewType, SerializedBookType } from 'models/book';
import BookDetails from '@components/BookDetails';

interface BookPageProps {
    error?: string;
}

export default function BookPage({ error }: BookPageProps): any {
    const [session, loading] = useSession();
    const router = useRouter();
    const { id } = router.query;

    const { data, isLoading } = useQuery([`book-${id}`, id], () => getBook(id, true));


    if ((typeof window !== 'undefined' && loading) || !session) return null;
    if (!id) return <ErrorPage statusCode={404} message="No book selected" />;
    if (!data) {
        if (isLoading) {
            return <div>Loading</div>;
        }
        return (
            <ErrorPage statusCode={404} message="No book found with provided ID" />
        );
    }


    const user = session.user;
    if (error) {
        return <p>There was an error</p>;
    }

    return (
        <AppLayout user={user} showMovies>
            <NextSeo title={data.title} />
            <BookDetails book={data} user={user}/>
            <ReviewSection book={data} />
            <ReviewModal user={session?.user} showReviewButton={false} />
        </AppLayout>
    )
}

interface SSRProps {
    props?: {
        session: Session | null;
        dehydratedState?: any;
    };
    redirect?: {
        destination: string;
        permanent: boolean;
    };
}

export async function getServerSideProps(
    ctx: GetServerSidePropsContext
): Promise<SSRProps> {
    const { id } = ctx.query;
    const queryClient = new QueryClient();
    if (!id) {
        return {
            props: { session: null },
        };
    }
    const session = await getSession({ req: ctx.req });
    if (!session) {
        return {
            redirect: {
                destination: `/?book=${id}`,
                permanent: false,
            },
        };
    }

    if (session?.user?.isBanned) {
        return {
            redirect: {
                destination: `/`,
                permanent: false,
            },
        };

    }

    await queryClient.fetchQuery([`book-${id}`, id], () => getBook(id, true));

    return {
        props: {
            session
        },
    };
}
