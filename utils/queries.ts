import { SerializedUser, PopulatedUserType } from './../models/user';
import { ReviewType, SerializedMovieType } from '../models/movie';
import { SerializedRestaurantType } from 'models/restaurant';
import { SerializedBookType } from 'models/book';

export const getMovies = async (): Promise<
  SerializedMovieType<ReviewType<PopulatedUserType>[]>[] | null
> => {
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URI}/api/movie`
  );
  // eslint-disable-next-line no-return-await
  const unsortedMovies: {
    data: SerializedMovieType<ReviewType<PopulatedUserType>[]>[];
  } = await res.json();

  if (!unsortedMovies?.data) return null;

  const movies: SerializedMovieType<ReviewType<PopulatedUserType>[]>[] =
    unsortedMovies.data;

  return movies;
};

export const getMovie = async (
  id: string | string[] | undefined,
  isLean: boolean
): Promise<SerializedMovieType<ReviewType<PopulatedUserType>[]> | null> => {
  if (!id) {
    return null;
  }
  if (Array.isArray(id)) {
    id = id.join('');
  }
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URI}/api/movie/${id}/${
      isLean && '?isLean=true'
    }`
  );

  // eslint-disable-next-line no-return-await
  const movie: SerializedMovieType<
    ReviewType<PopulatedUserType>[]
  > = await res.json();

  if (((movie as unknown) as { error: string })?.error) {
    return null;
  }

  return movie;
};

export const getUsers = async (): Promise<SerializedUser[]> => {
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URI}/api/users`
  );

  const { users }: { users: SerializedUser[] } = await res.json();

  return users;
};

export const getRestaurants = async() : Promise<any> => {
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URI}/api/restaurant`
  );
  // eslint-disable-next-line no-return-await
  const unsortedRestaurants = await res.json();
  if (!unsortedRestaurants?.data) return null;
  return unsortedRestaurants;
}


export const getRestaurant = async (
  id: string | string[] | undefined,
  isLean: boolean
): Promise<SerializedRestaurantType<ReviewType<PopulatedUserType>[]> | null> => {
  if (!id) {
    return null;
  }
  if (Array.isArray(id)) {
    id = id.join('');
  }
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URI}/api/restaurant/${id}/${
      isLean && '?isLean=true'
    }`
  );

  // eslint-disable-next-line no-return-await
  const restaurant: SerializedRestaurantType<
    ReviewType<PopulatedUserType>[]
  > = await res.json();

  if (((restaurant as unknown) as { error: string })?.error) {
    return null;
  }

  return restaurant;
};

export const getBooks = async() : Promise<SerializedBookType<ReviewType<PopulatedUserType>[]>[] | null> => {
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URI}/api/book`
  );
  // eslint-disable-next-line no-return-await
  const allBooks = await res.json();
  if (!allBooks?.data) return null;
  return allBooks.data;
}

export const getBook = async (
  id: string | string[] | undefined,
  isLean: boolean
): Promise<SerializedBookType<ReviewType<PopulatedUserType>[]> | null> => {
  if (!id) {
    return null;
  }
  if (Array.isArray(id)) {
    id = id.join('');
  }
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URI}/api/book/${id}/${
      isLean && '?isLean=true'
    }`
  );

  // eslint-disable-next-line no-return-await
  const book: SerializedBookType<
    ReviewType<PopulatedUserType>[]
  > = await res.json();

  if (((book as unknown) as { error: string })?.error) {
    return null;
  }

  return book;
};
