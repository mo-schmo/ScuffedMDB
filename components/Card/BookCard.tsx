import Image from 'next/image';
import {
    Box,
    Text,
    useColorModeValue,
    Flex,
    chakra,
    HStack,
    Tag,
    Skeleton,
    Avatar,
    AvatarGroup,
    VStack,
    Heading,
    Button,
    Container,
    Collapse
} from '@chakra-ui/react';
import Link from 'next/link';
import { ReviewType, SerializedMovieType } from '../../models/movie';
import Rating from '../Rating';
import { PopulatedUserType } from '../../models/user';
import { getColorSchemeCharCode } from '../../utils/utils';
import { useState, useEffect } from 'react';
import restaurant from 'models/restaurant';
import { SerializedBookType } from 'models/book';

interface CardProps {
    book?: SerializedBookType<ReviewType<PopulatedUserType>[]>;
}

export const BookCard: React.FC<CardProps> = ({
    book
}): React.ReactElement => {
    // const { image, name, genres, rating, numReviews, tagLine } = movie;
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [image, setImage] = useState<string | undefined | null>();
    const [isViewLoaded, setViewLoaded] = useState(false);
    const [show, setShow] = useState(false)

    const handleToggle = () => setShow(!show)

    useEffect(() => {
        setImage(book?.imageUrl);
        setViewLoaded(true);
    }, [book])

    function toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    return (
        <Skeleton isLoaded={isViewLoaded} shallow={true}>
            <Box as={'a'} height="auto">
                <chakra.div
                    position="relative"
                    direction="column"
                    maxW="400px"
                    mx="auto"
                    w="full"
                    bg={useColorModeValue(`white`, `gray.900`)}
                    boxShadow="xl"
                    rounded="md"
                    transition="all 0.25s"
                    transitionTimingFunction="spring(1 100 10 10)"
                    p={6}
                    _hover={{
                        transform: `translateY(-4px)`,
                        shadow: `2xl`,
                        cursor: 'pointer',
                    }}
                    overflow="hidden"
                    height="full"
                    onClick={handleToggle}
                >
                    <Box mt={-6} mx={-6} mb={6} pos="relative">
                        <Skeleton isLoaded={isImageLoaded}>
                            <Image
                                src={image ? image : `/svg/logo-no-background-${process.env.COLOR_THEME}.svg`}
                                width="0"
                                onLoad={() => setIsImageLoaded(true)}
                                sizes="(max-width: 2561px) 400px"
                                height="0"
                                alt={`${book?.title} cover`}
                                className="w-[400px] h-[225px] object-contain"
                            />
                        </Skeleton>
                    </Box>
                    {
                        !show &&
                        <>
                            <Flex direction="column" justifyContent="space-between">
                                <Flex direction={'column'}>
                                    <Flex
                                        justifyContent="space-between"
                                        alignItems="center"
                                        maxW="full"
                                    >
                                        <VStack w={'full'} align={'left'}>
                                            <Text
                                                as="h3"
                                                color={useColorModeValue(`gray.700`, `white`)}
                                                fontSize="md"
                                                fontWeight="bold"
                                                maxW="full"
                                            >
                                                {book?.title}
                                            </Text>
                                            <HStack>
                                                {

                                                    (book?.subjects?.length > 0) &&
                                                    book?.subjects?.slice(0, 1).map((subject, index) => (
                                                        <Tag
                                                            key={`${index.toString()}`}
                                                            whiteSpace="wrap"
                                                            mr="5px!important"
                                                            colorScheme={getColorSchemeCharCode(subject)}
                                                            fontWeight="600"
                                                            fontSize="sm"
                                                            minW="auto"
                                                        >
                                                            {toTitleCase(subject)}
                                                        </Tag>
                                                    ))
                                                }
                                            </HStack>
                                            <HStack
                                                justifyContent="space-between"
                                                alignItems="flex-start"
                                                mt={3}
                                            >
                                                <Text color="gray.500">
                                                    {book?.authors?.[0]}
                                                </Text>

                                                <Rating rating={book.rating} numReviews={book.numReviews} />
                                            </HStack>
                                        </VStack>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </>
                    }
                    <Collapse in={show} className='items-center'>
                        <Flex direction={'column'}>
                            <Container centerContent fontSize={'sm'} noOfLines={8}>
                                {book?.textSnippet ?? book?.description}
                            </Container>
                        </Flex>
                    </Collapse>
                    {
                        show &&
                        <Link href={`/book/${book?._id}` ?? '/'} passHref>
                            <Button m={3}>
                                View Book
                            </Button>
                        </Link>
                    }
                </chakra.div>
            </Box>
        </Skeleton>
    );
};
