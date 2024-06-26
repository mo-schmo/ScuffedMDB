import React from 'react';
import { Divider, Flex } from '@chakra-ui/react';
import AppLayout from '../../components/AppLayout';
import AboutUserSection from '../../components/AboutUserSection';
import User, { PopulatedUserType, SerializedUser } from '../../models/user';
import { ReviewType, SerializedMovieType } from '../../models/movie';
import UserReviewSection from '../../components/UserReviewSection';
import type { GetServerSidePropsContext } from 'next';
import dbConnect from '../../utils/dbConnect';
import { getSession, useSession } from 'next-auth/client';
import type { Session } from 'next-auth';
import { useQuery, dehydrate, QueryClient, useQueryClient } from '@tanstack/react-query';
import { NextSeo } from 'next-seo';
import ErrorPage from '@components/ErrorPage';
import { ReviewModal } from '@components/ReviewModal/ReviewModal';
import { getBooks, getMovies, getRestaurants } from 'utils/queries';
import { SerializedRestaurantType } from 'models/restaurant';

export interface UserPageUser extends SerializedUser {
  sub: string;
}
interface EditUserProps {
  desiredUser: UserPageUser | null;
}

function EditUser({ desiredUser, ...props }: EditUserProps): React.ReactNode {
  const { data } = useQuery(['movies'], () => getMovies());
  const { data: restaurantData } = useQuery([`restaurants`], () => getRestaurants());
  const { data: bookData } = useQuery([`books`], () => getBooks());

  const movies = data;
  const restaurants = restaurantData?.data;
  const books = bookData;

  const [session, loading] = useSession();
  if ((typeof window !== 'undefined' && loading) || !session) return null;
  const user = session.user;

  if (!desiredUser) {
    return (
      <ErrorPage
        statusCode={404}
        message={'That user could not be located :('}
      />
    );
  }
  desiredUser.sub = desiredUser._id as string;
  if (!movies || !restaurants) {
    return <div>Loading items :(</div>;
  }

  const allRestaurantRatings = restaurants
  ?.map((restaurant) => {
    const rev = restaurant?.reviews?.find((review) => {
      if (!review.user) return false; // If user is deleted and has made a review the user object is null in the review.
      return review.user._id === desiredUser._id;
    });
    if (!rev) {
      return null;
    }
    rev.item = {
      _id: restaurant._id,
      name: restaurant.name,
      image: restaurant.image_url,
    };
    return rev;
  })
  .filter((x) => x)
  .sort((a, b) => (a && b ? a.rating - b.rating : 0))
  .reverse();

  const allMovieRatings = movies
    ?.map((movie) => {
      const rev = movie?.reviews?.find((review) => {
        if (!review.user) return false; // If user is deleted and has made a review the user object is null in the review.
        return review.user._id === desiredUser._id;
      });
      if (!rev) {
        return null;
      }
      rev.item = {
        _id: movie._id,
        name: movie.name,
        image: movie.image,
        
      };
      return rev;
    })
    .filter((x) => x)
    .sort((a, b) => (a && b ? a.rating - b.rating : 0))
    .reverse();

    const allBookRatings = books
    ?.map((book) => {
      const rev = book?.reviews?.find((review) => {
        if (!review.user) return false; // If user is deleted and has made a review the user object is null in the review.
        return review.user._id === desiredUser._id;
      });
      if (!rev) {
        return null;
      }
      rev.item = {
        _id: book._id,
        name: book.title,
        image: book.openlibImageUrl ?? book.googleImageUrl,
      };
      return rev;
    })
    .filter((x) => x)
    .sort((a, b) => (a && b ? a.rating - b.rating : 0))
    .reverse();
    const allRatings = [...allRestaurantRatings, ...allMovieRatings, ...allBookRatings];
  return (
    <AppLayout user={user} showReview>
      <NextSeo title={desiredUser.name + '#' + desiredUser.discriminator} />
      <Flex direction="column" pt={16} maxW="6xl" mx="auto">
        <AboutUserSection user={desiredUser} reviews={allRatings} />
        <Divider mt={10} />
        <UserReviewSection movies={movies} restaurants={restaurants} books={books} user={desiredUser} />
        <ReviewModal user={session?.user} showReviewButton={false} />
      </Flex>
    </AppLayout>
  );
}

interface SSRProps {
  props: {
    session: Session | null;
    desiredUser: Omit<SerializedUser, 'sub'> | null;
  };
}

interface returnProps {
  redirect: {
    destination: string;
    permanent: boolean;
  };
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<returnProps | SSRProps> {
  const { uID } = ctx.query;
  await dbConnect();
  const session = await getSession(ctx);
  const queryClient = new QueryClient();
  if (!session || session.user.isBanned) {
    return { redirect: { destination: `/?user=${uID}`, permanent: false } };
  }
  let desiredUser;
  try {
    desiredUser = await User.findById(uID).lean();
  } catch (e) {
    return { props: { desiredUser: null, session, movies: [] } };
  }
  if (!desiredUser)
    return { props: { desiredUser: null, session, movies: [] } };

  desiredUser._id = desiredUser._id.toString();

  desiredUser.createdAt =
    typeof desiredUser.createdAt === 'string'
      ? desiredUser.createdAt
      : desiredUser.createdAt.toISOString();
  desiredUser.updatedAt =
    typeof desiredUser.updatedAt === 'string'
      ? desiredUser.updatedAt
      : desiredUser.updatedAt.toISOString();

  assertsIsSerializedUser(desiredUser);
  await queryClient.fetchQuery([`movies`], () => getMovies());
  await queryClient.fetchQuery([`restaurants`], () => getMovies());
  await queryClient.fetchQuery([`movies`], () => getBooks());
  return {
    props: {
      session,
      desiredUser: desiredUser || null
    },
  };
}

export default EditUser;

function assertsIsSerializedUser(
  user: unknown
): asserts user is SerializedUser {
  if (typeof user === 'object') {
    if (user) {
      if ('createdAt' in user && 'updatedAt' in user && '_id' in user) {
        const { createdAt, updatedAt, _id } = user as {
          createdAt: any;
          updatedAt: any;
          _id: any;
        };
        if (
          typeof createdAt === 'string' &&
          typeof updatedAt === 'string' &&
          typeof _id === 'string'
        ) {
          return;
        }
      }
    }
  }
  throw new Error('User is not serialized');
}
