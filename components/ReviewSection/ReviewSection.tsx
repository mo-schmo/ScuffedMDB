import {
    VStack,
    Heading,
    Box,
    Flex,
    Avatar,
    chakra,
    Text,
    IconButton,
    Stack,
    Tooltip,
    useToast,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    Button,
    Link as ChakraLink,
    useColorMode,
} from '@chakra-ui/react';
//@ts-ignore
import ReactMarkdown from 'react-markdown';
import { PopulatedUserType } from '../../models/user';
import React, { ReactElement } from 'react';
import { ReviewType, SerializedMovieType } from '../../models/movie';
import Wave from '../Wave';
import { EditIcon } from '@chakra-ui/icons';
import { DeleteIcon } from '@chakra-ui/icons';
import { useContext } from 'react';
import Link from 'next/link';
import { ReviewModalContext } from 'utils/ModalContext';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/client';
import { SerializedRestaurantType } from 'models/restaurant';
import { SerializedBookType } from 'models/book';


interface ReviewProps {
    review: ReviewType<PopulatedUserType>;
    movie?: SerializedMovieType<ReviewType<PopulatedUserType>[]> | null;
    restaurant?: SerializedRestaurantType<ReviewType<PopulatedUserType>[]> | null;
    book?: SerializedBookType<ReviewType<PopulatedUserType>[]> | null;
}


interface Props {
    movie?: SerializedMovieType<ReviewType<PopulatedUserType>[]>;
    restaurant?: SerializedRestaurantType<ReviewType<PopulatedUserType>[]>;
    book?: SerializedBookType<ReviewType<PopulatedUserType>[]> | null;
}

interface ReviewActionsProps extends Omit<ReviewProps, 'user'> {
    toInvalidate?: string;
    centred?: boolean;
}

export default function ReviewSection({ movie, restaurant, book }: Props) {
    return (
        <Box maxWidth="7xl" mt="9rem" mx={'auto'} mb={40}>
            {
                movie &&
                <>
                    <VStack alignItems="center" spacing={3} mt={{ base: 28, lg: 0 }}>
                        <Wave mx="auto" width={{ base: '70%', md: '30%' }} />
                        <Heading fontSize="6xl">
                            {movie.reviews.length} Review{movie.reviews.length !== 1 && 's'}
                        </Heading>
                        <Wave
                            mt={'15px!important'}
                            mx="auto!important"
                            width={{ base: '70%', md: '30%' }}
                        />
                    </VStack>
                    <Flex mt={10} direction="column">
                        {movie.reviews.map((review: ReviewType<PopulatedUserType>, i) => (
                            <Review movie={movie} review={review} key={i.toString()} />
                        ))}
                    </Flex>
                </>
            }
            {
                restaurant &&
                <>
                    <VStack alignItems="center" spacing={3} mt={{ base: 28, lg: 0 }}>
                        <Wave mx="auto" width={{ base: '70%', md: '30%' }} />
                        <Heading fontSize="6xl">
                            {restaurant.reviews.length} Review{restaurant.reviews.length !== 1 && 's'}
                        </Heading>
                        <Wave
                            mt={'15px!important'}
                            mx="auto!important"
                            width={{ base: '70%', md: '30%' }}
                        />
                    </VStack>
                    <Flex mt={10} direction="column">
                        {restaurant.reviews.map((review: ReviewType<PopulatedUserType>, i) => (
                            <Review restaurant={restaurant} review={review} key={i.toString()} />
                        ))}
                    </Flex>
                </>
            }
            {
                book &&
                <>
                    <VStack alignItems="center" spacing={3} mt={{ base: 28, lg: 0 }}>
                        <Wave mx="auto" width={{ base: '70%', md: '30%' }} />
                        <Heading fontSize="6xl">
                            {book.reviews.length} Review{book.reviews.length !== 1 && 's'}
                        </Heading>
                        <Wave
                            mt={'15px!important'}
                            mx="auto!important"
                            width={{ base: '70%', md: '30%' }}
                        />
                    </VStack>
                    <Flex mt={10} direction="column">
                        {book.reviews.map((review: ReviewType<PopulatedUserType>, i) => (
                            <Review book={book} review={review} key={i.toString()} />
                        ))}
                    </Flex>
                </>
            }
        </Box >
    );
}

export const ReviewActions = ({
    review,
    toInvalidate,
    movie,
    restaurant,
    centred,
    book
}: ReviewActionsProps): JSX.Element | null => {
    const [session] = useSession();
    const userId = session?.user?._id || session?.user?.sub; // accomodate incase theya re UserAuthtype or MongoUserType
    const toast = useToast();
    const { onOpen, setMovie, setRestaurant, setBook } = useContext(ReviewModalContext);
    const queryClient = useQueryClient();
    const handleReviewDelete = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        const response = await fetch(`/api/review`, {
            method: 'DELETE',
            body: JSON.stringify({
                movieID: movie?._id,
                restaurantID: restaurant?._id,
                bookID: book?._id,
                reviewID: review._id,
            }),
        });
        const data = await response.json();
        if (response.status !== 200) {
            return toast({
                title: 'There was an error deleting that review...',
                description: data.message,
                status: 'error',
                variant: 'subtle',
            });
        } else {
            toast({
                title: 'Review deleted',
                description: 'Your review has been deleted',
                status: 'success',
                variant: 'subtle',
            });
            await queryClient.invalidateQueries({ queryKey: [(toInvalidate || `movie-${movie?._id}`)] });
            await queryClient.invalidateQueries({ queryKey: [(toInvalidate || `restaurant-${restaurant?._id}`)] });
            await queryClient.invalidateQueries({ queryKey: [(toInvalidate || `book-${book?._id}`)] });
        }
    };
    if (review?.user?._id === userId || session?.user?.isAdmin) {
        return (
            <Stack
                isInline
                ml={{ base: 0, md: 3 }}
                justifyContent={centred ? 'center' : 'flex-start'}
            >
                {review?.user?._id === userId && (
                    <Tooltip placement="top" label="Edit your review">
                        <IconButton
                            icon={<EditIcon />}
                            aria-label="Edit review"
                            colorScheme={process.env.COLOR_THEME}
                            variant="ghost"
                            onClick={() => {
                                console.log(book);
                                if (movie) {
                                    setMovie(movie);
                                }
                                else if (restaurant) {
                                    setRestaurant(restaurant);
                                }
                                else if (book) {
                                    setBook(book);
                                }
                                onOpen();
                            }}
                        />
                    </Tooltip>
                )}
                <Popover>
                    <Tooltip
                        placement="top"
                        label={`Delete ${review.user?._id === userId
                            ? 'your'
                            : review.user?.username + "'s"
                            } review`}
                    >
                        <span>
                            <PopoverTrigger>
                                <IconButton
                                    icon={<DeleteIcon />}
                                    aria-label="Delete review"
                                    colorScheme="red"
                                    variant="ghost"
                                />
                            </PopoverTrigger>
                        </span>
                    </Tooltip>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Are you sure?</PopoverHeader>
                        <PopoverBody>
                            Deleting this review is irreversible!
                            <Stack isInline ml="auto">
                                <Button
                                    size="sm"
                                    ml="auto"
                                    mt="2"
                                    colorScheme="red"
                                    onClick={handleReviewDelete}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </Stack>
        );
    }
    return null;
};


const Review = ({ review, movie, restaurant, book }: ReviewProps) => {
    const { colorMode } = useColorMode();
    return (
        <VStack mt={8} alignItems="flex-start" spacing={3} px={4}>
            <Flex
                direction={{ base: 'column', lg: 'row' }}
                width="full"
                alignItems="center"
            >
                <Avatar size="lg" src={review?.user?.image} />
                <chakra.div display="flex" alignItems="center">
                    <Link href={`/user/${review?.user?._id}`} passHref>
                        <Heading as={ChakraLink} size="2xl" ml={5} maxWidth="full">
                            {review?.user?.username}
                            <chakra.span
                                color={'gray.500'}
                                fontWeight="semibold"
                                fontSize="lg"
                            >
                                {' '}
                                #{review?.user?.discriminator}
                            </chakra.span>
                        </Heading>
                    </Link>
                    {
                        movie && <ReviewActions review={review} movie={movie} />
                    }
                    {
                        restaurant && <ReviewActions review={review} restaurant={restaurant} />
                    }
                    {
                        book && <ReviewActions review={review} book={book} />
                    }
                </chakra.div>
                <chakra.div
                    display="flex"
                    ml={{ base: 0, lg: 'auto' }}
                    alignItems="center"
                >
                    <Text fontSize="4xl" fontWeight="bold">
                        {review.rating}
                        <chakra.span color={'gray.500'} fontWeight="semibold" fontSize="lg">
                            {' '}
                            /10
                        </chakra.span>
                    </Text>
                </chakra.div>
            </Flex>
            <Text
                fontSize="lg"
                listStylePosition="inside"
                sx={{
                    //Select all children bar the first element and add margin to emulate paragraph  separation
                    'p:first-child ~ p': {
                        marginTop: '4',
                    },
                }}
                color={
                    review?.comment
                        ? colorMode === 'light'
                            ? 'gray.900'
                            : 'white'
                        : 'gray.500'
                }
            >
                <ReactMarkdown
                    skipHtml
                    disallowedElements={['img', 'a', 'code', 'pre']}
                >
                    {review.comment || 'No comment'}
                </ReactMarkdown>
            </Text>
        </VStack>
    );
};