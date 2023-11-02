export interface MovieEndpointBodyType {
  id: string;
}

export interface ReviewEndpointBodyType {
  restaurantID?: string;
  movieID?: string;
  bookID?: string;
  comment?: string;
  rating: number;
}
