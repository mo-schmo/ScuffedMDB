/* eslint-disable @typescript-eslint/no-empty-function */
import { PopulatedUserType } from './../models/user';
import React, { Dispatch, SetStateAction } from 'react';
import { ReviewType, SerializedMovieType } from '../models/movie';
import { SerializedRestaurantType } from 'models/restaurant';
import { SerializedBookType } from 'models/book';

interface ReviewContext {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  movie: null | SerializedMovieType<ReviewType<PopulatedUserType>[]>;
  setMovie: Dispatch<
    SetStateAction<SerializedMovieType<ReviewType<PopulatedUserType>[]> | null>
  >;
  restaurant: null | SerializedRestaurantType<ReviewType<PopulatedUserType>[]>;
  setRestaurant: Dispatch<
    SetStateAction<null | SerializedRestaurantType<ReviewType<PopulatedUserType>[]>>
  >;
  book: null | SerializedBookType<ReviewType<PopulatedUserType>[]>;
  setBook: Dispatch<SetStateAction<null | SerializedBookType<ReviewType<PopulatedUserType>[]>>>
}

export const ReviewModalContext = React.createContext<ReviewContext>({
  isOpen: false,
  onOpen: () => { },
  onClose: () => { },
  movie: null,
  setMovie: () => { },
  restaurant: null,
  setRestaurant: () => { },
  book: null,
  setBook: () => { },
});
