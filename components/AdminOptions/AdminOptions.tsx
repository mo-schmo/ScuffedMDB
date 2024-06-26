import { UserAuthType } from 'next-auth';
import { ReviewType, SerializedMovieType } from 'models/movie';
import { SerializedRestaurantType } from 'models/restaurant';
import { SerializedBookType } from 'models/book';
import { PopulatedUserType } from 'models/user';
import React, { ReactElement, useContext, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { ReviewModalContext } from 'utils/ModalContext';
import { SettingsIcon, ArrowBackIcon, EditIcon, ExternalLinkIcon, AddIcon } from '@chakra-ui/icons';
import {
    Flex,
    Box,
    AspectRatio,
    Tag,
    Stack,
    TagLabel,
    useMediaQuery,
    Heading,
    VStack,
    Text,
    chakra,
    StatGroup,
    Stat,
    StatLabel,
    StatNumber,
    Button,
    Icon,
    useBreakpoint,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    MenuDivider,
    useColorMode,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    useColorModeValue,
    Skeleton,
} from '@chakra-ui/react';

export default function AdminOptions({
    user,
    movie,
    restaurant,
    book
}: {
    user: UserAuthType;
    movie?: SerializedMovieType<ReviewType<PopulatedUserType>[]>;
    restaurant?: SerializedRestaurantType<ReviewType<PopulatedUserType>[]>;
    book?: SerializedBookType<ReviewType<PopulatedUserType>[]>;
}) {
    const { colorMode } = useColorMode();

    const { onOpen: reviewOnOpen, setMovie: setModalMovie, setRestaurant: setModalRestaurant, setBook: setModalBook } = useContext(
        ReviewModalContext
    );
    const toast = useToast();

    const [isOpen, setIsOpen] = React.useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef(null);
    const router = useRouter();
    const queryClient = useQueryClient();

    function showAddIcon() {
        return (movie && !movie.reviews.find((rvw) => rvw.user?._id === user.sub))
            || (restaurant && !restaurant.reviews.find((rvw) => rvw.user?._id === user.sub))
            || (book && !book.reviews.find((rvw) => rvw.user?._id === user.sub))
    };

    const handleMovieDelete = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_APP_URI}/api/movie`,
                {
                    method: `delete`,
                    // eslint-disable-next-line no-underscore-dangle
                    body: JSON.stringify({ id: movie?._id }),
                }
            );
            const data = await response.json();

            if (response.status !== 200) {
                return toast({
                    variant: `subtle`,
                    title: `There was an error`,
                    description: data.message,
                    status: `error`,
                    duration: 5000,
                    isClosable: true,
                });
            }
            router.push('/', undefined, { shallow: true });
            toast({
                variant: `subtle`,
                title: `Movie Deleted`,
                description: `${data.name} was deleted successfully :)`,
                status: `success`,
                duration: 5000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                variant: `subtle`,
                title: `There was an error`,
                description: err.message,
                status: `error`,
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleRestaurantDelete = async () => {
        try {
            const options = {
                method: 'delete',
                body: JSON.stringify({ id: restaurant?._id })
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URI}/api/restaurant`, options);

            const data = await response.json();

            if (response.status !== 200) {
                return toast({
                    variant: `subtle`,
                    title: `There was an error`,
                    description: data.message,
                    status: `error`,
                    duration: 5000,
                    isClosable: true,
                });
            }
            router.push('/', undefined, { shallow: true });
            toast({
                variant: `subtle`,
                title: `Restaurant Deleted`,
                description: `${data.name} was deleted successfully :)`,
                status: `success`,
                duration: 5000,
                isClosable: true,
            });
        }
        catch (err) {
            toast({
                variant: `subtle`,
                title: `There was an error`,
                description: err.message,
                status: `error`,
                duration: 5000,
                isClosable: true,
            });
        }
    }

    const handleBookDelete = async () => {
        try {
            const options = {
                method: 'delete',
                body: JSON.stringify({ id: book?._id })
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URI}/api/book`, options);

            const data = await response.json();

            if (response.status !== 200) {
                return toast({
                    variant: `subtle`,
                    title: `There was an error`,
                    description: data.message,
                    status: `error`,
                    duration: 5000,
                    isClosable: true,
                });
            }
            router.push('/', undefined, { shallow: true });
            toast({
                variant: `subtle`,
                title: `Book Deleted`,
                description: `${data.title} was deleted successfully :)`,
                status: `success`,
                duration: 5000,
                isClosable: true,
            });
        }
        catch (err) {
            toast({
                variant: `subtle`,
                title: `There was an error`,
                description: err.message,
                status: `error`,
                duration: 5000,
                isClosable: true,
            });
        }
    }
    return (
        <Stack
            isInline
            justifyContent="space-between"
            mb={3}
            maxWidth={{ base: '100%', lg: 'full' }}
            mx="auto"
        >
            <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                colorScheme={process.env.COLOR_THEME}
                onClick={() => router.push('/', undefined, { shallow: true })}
            >
                Back to home
            </Button>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete {movie ? movie?.name : restaurant?.name}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? This is permanent, the movie and reviews will be deleted
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={() => {
                                    onClose();
                                    if (movie) {
                                        return handleMovieDelete();
                                    }
                                    else if (restaurant) {
                                        return handleRestaurantDelete();
                                    }
                                    else if (book) {
                                        return handleBookDelete();
                                    }
                                }}
                                ml={3}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            {
                (movie || restaurant || book) &&
                <Menu>
                    <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<SettingsIcon />}
                        variant="outline"
                    />
                    <MenuList>
                        <MenuItem
                            onClick={() => {
                                if (movie) {
                                    setModalMovie(movie);
                                }
                                else if (restaurant) {
                                    setModalRestaurant(restaurant)
                                }
                                else if (book) {
                                    setModalBook(book);
                                }
                                return reviewOnOpen();
                            }}
                            icon={
                                (movie && !movie.reviews.find((rvw) => rvw.user?._id === user.sub)) || (restaurant && !restaurant.reviews.find((rvw) => rvw.user?._id === user.sub)) || (book && !book.reviews.find((rvw) => rvw.user?._id === user.sub)) ? (
                                    <AddIcon />
                                ) : (
                                    <EditIcon />
                                )
                            }
                        >
                            {(movie && !movie.reviews.find((rvw) => rvw.user?._id === user.sub)) ||
                                (restaurant && !restaurant.reviews.find((rvw) => rvw.user?._id === user.sub)) ||
                                (book && !book.reviews.find((rvw) => rvw.user?._id === user.sub))
                                ? 'Add Review'
                                : 'Edit Review'}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                let description = 'Link';
                                if (movie) {
                                    description = movie?.name;
                                }
                                else if (restaurant) {
                                    description = restaurant?.name;
                                }
                                else if (book) {
                                    description = book?.title;
                                }
                                toast({
                                    variant: 'subtle',
                                    title: 'Copied to clipboard',
                                    description: `${description} copied to clipboard`,
                                    isClosable: true,
                                    duration: 5000,
                                    status: 'success',
                                });
                                if (movie) {
                                    navigator.clipboard.writeText(
                                        `${process.env.NEXT_PUBLIC_APP_URI}/movie/${movie?._id}`
                                    );
                                }
                                else if (restaurant) {
                                    navigator.clipboard.writeText(
                                        `${process.env.NEXT_PUBLIC_APP_URI}/restaurant/${restaurant?._id}`
                                    );
                                }
                                else if (book) {
                                    navigator.clipboard.writeText(
                                        `${process.env.NEXT_PUBLIC_APP_URI}/book/${book?._id}`
                                    );
                                }
                            }}
                            icon={<ExternalLinkIcon />}
                        >
                            Share
                        </MenuItem>
                        {user.isAdmin && (
                            <>
                                <MenuDivider />

                                <MenuItem
                                    color={colorMode === 'light' ? 'red.500' : 'red.300'}
                                    icon={<EditIcon />}
                                    onClick={() => setIsOpen(true)}
                                >
                                    Delete
                                </MenuItem>
                            </>
                        )}
                    </MenuList>
                </Menu>
            }
        </Stack>
    );
};