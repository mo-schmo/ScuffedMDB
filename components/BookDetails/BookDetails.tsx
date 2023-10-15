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
  Collapse
} from '@chakra-ui/react';
import { IoChevronDown, IoLocationOutline } from 'react-icons/io5';
import { FaYelp, FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import React, { ReactElement, useContext, useState, useEffect } from 'react';
import { PopulatedUserType } from 'models/user';
import { UserAuthType } from 'next-auth';
import useScrollPosition from 'hooks/useScrollPosition.hook';
import Image from 'next/image';
import { getColorSchemeCharCode } from 'utils/utils';
import AdminOptions from 'components/AdminOptions';
import { ChevronDownIcon } from '@chakra-ui/icons'
import { StarRating } from '@components/Rating/Rating';
import Link from 'next/link';
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi'
import { ReviewType, SerializedBookType } from 'models/book';
import { format } from 'date-fns';
import { OpenLibSchema } from 'models/api/books/openLibrarySchema';




interface Props {
  book: SerializedBookType<ReviewType<PopulatedUserType>[]>;
  user: UserAuthType;
}

export default function BookDetails({ book, user }: Props): any {
  const bp = useBreakpoint();
  const [isLargerThan800] = useMediaQuery('(min-width: 800px)');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [openlibData, setOpenlibData] = useState<OpenLibSchema | undefined | null>();
  const { scrollPosition } = useScrollPosition();

  const [show, setShow] = useState(false)

  const handleToggle = () => setShow(!show)

  const getShorterText = () => {
    return book.description;
  }

  useEffect(() => {
    if (book?.isbn) {
      const url = `${process.env.NEXT_PUBLIC_APP_URI}/api/book/openlibrary?isbn=${book?.isbn}`
      fetch(url).then(res => res.json()).then(data => setOpenlibData(data)).catch(_ => setOpenlibData(null));
    }
  }, []);

  return (
    <Flex maxWidth="7xl" mx={'auto'} mt="10px">
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
            bottom={'60px'}
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
          <AdminOptions user={user} book={book} />
          <Flex direction={{ base: 'column', lg: 'row' }}>
            <Flex
              width={{ base: '90%', lg: '50%' }}
              mx="auto"
              maxWidth="full"
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
                    !book?.imageUrl ?
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
                        src={book?.imageUrl}
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
              mx="auto"
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
                      <TagLabel fontWeight={'600'}> {subject}</TagLabel>
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
              <Text
                fontSize="lg"
                fontStyle="italic"
                color={'gray.500'}
                fontWeight="bold"
              >
                {book?.authors?.[0]}
              </Text>
              <Collapse startingHeight={200} in={show}>
                <Container fontSize="lg" p={0}>{getShorterText()}</Container>
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
              <Flex
                justifyContent="start"
                width="full"
                mt={{ base: '20px!important', lg: 'auto!important' }}
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
            </VStack>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  )
}

function SkeletonImage({ image }: { image: string }) {
  useEffect(() => {
    if (image && image.length > 0) {
      setImageUrl(image)
    }
  })
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState('/no_image.jpg');
  return (
    <Skeleton borderRadius="xl" isLoaded={imageLoaded}>
      <Image
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageUrl('/no_image.jpg')}
        src={imageUrl}
        alt={`restaurant Image`}
        objectFit='contain'
        sizes={'100vw'}
        layout='fill'
      />
    </Skeleton>
  );
}