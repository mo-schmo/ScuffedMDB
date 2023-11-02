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
  useToast,
  useColorModeValue,
  Skeleton,
  Container,
  Collapse,
  HStack,
  Center
} from '@chakra-ui/react';
import { IoChevronDown } from 'react-icons/io5';
import React, { useState, useEffect } from 'react';
import { PopulatedUserType } from 'models/user';
import { UserAuthType } from 'next-auth';
import useScrollPosition from 'hooks/useScrollPosition.hook';
import Image from 'next/image';
import { getColorSchemeCharCode } from 'utils/utils';
import AdminOptions from 'components/AdminOptions';
import { ChevronDownIcon } from '@chakra-ui/icons'
import { StarRating } from '@components/Rating/Rating';
import Link from 'next/link';
import { ReviewType, SerializedBookType } from 'models/book';
import { format } from 'date-fns';
import { OpenLibSchema, RatingSchema } from 'models/api/books/openLibrarySchema';
import { FcGoogle } from "react-icons/fc";
import { FaAmazon, FaGoodreadsG } from "react-icons/fa";




interface Props {
  book: SerializedBookType<ReviewType<PopulatedUserType>[]>;
  user: UserAuthType;
}

export default function BookDetails({ book, user }: Props): any {
  const bp = useBreakpoint();
  const [isLargerThan800] = useMediaQuery('(min-width: 800px)');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [openlibData, setOpenlibData] = useState<OpenLibSchema | undefined | null>();
  const [openlibRating, setOpenlibRating] = useState<RatingSchema | undefined | null>();
  const { scrollPosition } = useScrollPosition();

  const [show, setShow] = useState(false)

  const handleToggle = () => setShow(!show)

  const getShorterText = () => {
    return new DOMParser().parseFromString(book.description, 'text/html').body.textContent;
  }

  function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

  function getHeightOfElement() {
    let box = document.querySelector('#details-description');
    const height = box?.offsetHeight ?? 50;
    if (height > 1000) {
      return height / 4;
    }
    else if (height > 200) {
      return height / 2;
    }

    return -1;
  }

  useEffect(() => {
    if (book?.isbn) {
      const url = `${process.env.NEXT_PUBLIC_APP_URI}/api/book/openlibrary?isbn=${book?.isbn}`
      fetch(url).then(res => res.json()).then(data => setOpenlibData(data)).catch(_ => setOpenlibData(null));
    }
    if (book?.openlibraryId) {
      const url = `https://openlibrary.org/works/${book?.openlibraryId}/ratings.json`;
      fetch(url).then(res => {
        if (res.status === 200) {
          res.json();
        }
        return null;
      }
      ).then(data => setOpenlibRating(data)).catch(_ => setOpenlibRating(null));
    }
  }, []);

  return (
    <Flex mt="10px">
      <Flex
        direction="column"
        width="full"
        justifyContent="center"
        mt={{
          base: 'max(-80px,-1vh)',
          xl: '5vh',
          '2xl': '10vh',
          '4xl': '12em',
        }}
        mx={{
          lg: '2vw'
        }}
      >
        {/* Scroll down section */}
        {bp && !['base', 'sm', 'md'].includes(bp) && (
          <Flex
            direction="column"
            alignItems="center"
            position="absolute"
            bottom={'10px'}
            left={'50%'}
            transform={'translateX(-50%)'}
            color={'gray.500'}
            visibility={scrollPosition ? 'hidden' : 'visible'}
            opacity={scrollPosition ? 0 : 1}
            transition={'all 0.25s'}
          >
            <Text fontWeight="semibold">Scroll to see reviews</Text>
            <Icon
              className="bouncing-arrow"
              as={(props) => <IoChevronDown strokeWidth="20" {...props} />}
              height={6}
              mt={2}
              width={6}
            />
          </Flex>
        )}
        <Box minHeight="calc(100vh - 80px)">
          <div className='mx-5'>
            <AdminOptions user={user} book={book} />
          </div>
          <Flex direction={{ base: 'column', lg: 'row' }}>
            <Flex
              width={{ base: '90%', lg: '50%' }}
              mx="auto"
              maxWidth={{ base: "full", 'xl': "500px" }}
              alignItems='flex-start'
              pr={{ base: 0, lg: '20px' }}
            >
              <AspectRatio
                borderRadius="xl"
                ratio={16 / 14}
                width="full"
              >
                <Skeleton borderRadius="xl" isLoaded={isImageLoaded}>
                  {
                    (!book?.googleImageUrl && !book?.openlibImageUrl) ?
                      <Image
                        className={'borderRadius-xl'}
                        src={'/no_image.jpg'}
                        alt={`no book cover`}
                        sizes={'50vw'}
                        layout="fill"
                        onLoad={() => setIsImageLoaded(true)}
                      />
                      :
                      <Image
                        className={'borderRadius-xl'}
                        src={book?.openlibImageUrl ?? book?.googleImageUrl}
                        alt={`${book?.title} cover`}
                        sizes={'50vw'}
                        layout="fill"
                        objectFit='contain'
                        onLoad={() => setIsImageLoaded(true)}
                      />
                  }
                </Skeleton>
              </AspectRatio>
            </Flex>
            <VStack
              mx={{ base: "auto" }}
              pl={{ base: 0, lg: '20px' }}
              alignItems="flex-start"
              maxWidth={{ base: '90%', lg: '50%' }}
            >
              <Stack spacing={4} mt={{ base: '5', lg: 0 }} isInline>
                {book?.subjects?.slice(0, 3).map((subject, i) => {
                  return (
                    <Tag
                      size={isLargerThan800 ? 'md' : 'sm'}
                      key={i.toString()}
                      colorScheme={getColorSchemeCharCode(subject)}
                    >
                      <TagLabel fontWeight={'600'}> {toTitleCase(subject)}</TagLabel>
                    </Tag>
                  );
                })}
              </Stack>
              <Heading
                lineHeight="1.1em"
                transform={'translateX(-3px)'}
                fontSize={{
                  'base': '4xl',
                  'lg': '6xl'
                }}
              >
                {book?.title}
              </Heading>
              <Link href={openlibData?.authors?.[0]?.url ?? '#'} passHref target="_blank">
                <Text
                  fontSize="lg"
                  fontStyle="italic"
                  color={'gray.500'}
                  fontWeight="bold"
                >
                  by <span className='underline'>{book?.authors?.[0]}</span>
                </Text>
              </Link>
              {
                openlibRating ? (
                  <HStack>
                    <StarRating rating={openlibRating?.summary?.average} />
                    <Text color={'gray.500'} fontSize={'sm'}>{openlibRating?.summary?.average}</Text>
                    <Text color={'gray.500'} fontSize={'sm'}>({openlibRating?.summary?.count} reviews)</Text>
                  </HStack>
                ) :
                  (
                    <>
                      {
                        book?.ratingsCount > 0 &&
                        <HStack>
                          <StarRating rating={book?.averageRating} />
                          <Text color={'gray.500'} fontSize={'sm'}>{book?.averageRatinge}</Text>
                          <Text color={'gray.500'} fontSize={'sm'}>({book?.ratingsCount} reviews)</Text>
                        </HStack>
                      }
                    </>
                  )
              }
              {
                getHeightOfElement() >= 0 ?
                  (
                    <>
                      <Collapse startingHeight={200} in={show}>
                        <Container id='details-description' fontSize="lg" p={0}>{getShorterText()}</Container>
                      </Collapse>
                      <Flex alignItems='center'>
                        <Button size='sm' onClick={handleToggle} variant='unstyled' className='font-bold hover:underline'>
                          Show {show ? 'Less' : 'More'}
                        </Button>
                        {
                          show && <ChevronDownIcon className='rotate-180' boxSize={5} />
                        }
                        {
                          !show && <ChevronDownIcon boxSize={5} />
                        }
                      </Flex>
                    </>
                  ) :
                  (
                    <Container id='details-description' fontSize="lg" p={0}>{getShorterText()}</Container>
                  )
              }
              <Flex
                justifyContent="start"
                width="full"
                mt={{ base: '20px!important', lg: '20px!important' }}
              >
                {
                  book?.publishedDate &&
                  <VStack spacing={1} className='mr-4 items-baseline'>
                    <Text color={'gray.500'} fontSize="sm">
                      Published Date
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {format(new Date(book?.publishedDate), 'MMM yyyy')}
                    </Text>
                  </VStack>
                }
                <VStack spacing={1} className='mx-4'>
                  <Text color={'gray.500'} fontSize="sm">
                    Pages
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {book?.pageCount}
                  </Text>
                </VStack>
              </Flex>
              <HStack spacing={5} wrap={'wrap'} className='invisible md:visible'>
                {
                  book?.googleLink &&
                  <Link href={book?.googleLink} passHref target="_blank">
                    <Icon as={FcGoogle} boxSize={50} />
                  </Link>
                }
                {
                  book?.openlibraryUrl &&
                  <Link href={book?.openlibraryUrl} passHref target="_blank">
                    <Image
                      src="/svg/openlib.svg"
                      width={150}
                      height={150}
                      alt="Picture of the author"
                    />
                  </Link>
                }
                {
                  openlibData?.identifiers?.goodreads?.[0] &&
                  <Link href={`https://goodreads.com/book/show/${openlibData?.identifiers?.goodreads?.[0]}`} passHref target="_blank">
                    <Icon as={FaGoodreadsG} boxSize={50} />
                  </Link>
                }
                {
                  openlibData?.identifiers?.amazon?.[0] &&
                  <Link href={`https://www.amazon.com/dp/${openlibData?.identifiers?.amazon?.[0]}`} passHref target="_blank">
                    <Icon as={FcGoogle} boxSize={50} />
                  </Link>
                }
              </HStack>
            </VStack>
          </Flex>
          <StatGroup
            flexDirection={{ base: 'column' }}
            alignItems="stretch"
            justifyContent="space-between"
            width="full"
            textAlign="center"
            mt={0}
            className='visible md:invisible'
          >
            {
              book?.googleLink &&
              <Stat my={5}>
                <StatLabel color={'gray.500'} fontSize="lg">
                  View on Google
                </StatLabel>
                <StatNumber fontSize="5xl" fontWeight="bold">
                  <Link href={book?.googleLink} passHref target="_blank">
                    <Icon as={FcGoogle} boxSize={50} />
                  </Link>
                </StatNumber>
              </Stat>
            }
            {
              book?.openlibraryUrl &&
              <Stat my={5}>
                <StatLabel color={'gray.500'} fontSize="lg">
                  View on OpenLib
                </StatLabel>
                <StatNumber fontSize="5xl" fontWeight="bold" mt={5}>
                  <Center>
                    <Link href={book?.openlibraryUrl} passHref target="_blank" className='text-center'>
                      <Image
                        src="/svg/openlib.svg"
                        width={150}
                        height={150}
                        alt="Picture of the author"
                      />
                    </Link>
                  </Center>
                </StatNumber>
              </Stat>
            }
            {
              openlibData?.identifiers?.goodreads?.[0] &&
              <Stat my={5}>
                <StatLabel color={'gray.500'} fontSize="lg">
                  View on GoodReads
                </StatLabel>
                <StatNumber fontSize="5xl" fontWeight="bold">
                  <Link href={`https://goodreads.com/book/show/${openlibData?.identifiers?.goodreads?.[0]}`} passHref target="_blank">
                    <Icon as={FaGoodreadsG} boxSize={50} />
                  </Link>
                </StatNumber>
              </Stat>
            }
            {
              openlibData?.identifiers?.amazon?.[0] &&
              <Stat my={5}>
                <StatLabel color={'gray.500'} fontSize="lg">
                  View on Amazon
                </StatLabel>
                <StatNumber fontSize="5xl" fontWeight="bold">
                  <Link href={`https://www.amazon.com/dp/${openlibData?.identifiers?.amazon?.[0]}`} passHref target="_blank">
                    <Icon as={FcGoogle} boxSize={50} />
                  </Link>
                </StatNumber>
              </Stat>
            }
          </StatGroup>
        </Box>
      </Flex>
    </Flex>
  )
}