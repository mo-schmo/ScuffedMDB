import React, { FormEvent, useState } from 'react';
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    VStack,
    Skeleton,
    AspectRatio,
    Heading,
    HStack,
    Text,
    Box,
    Select,
    useColorMode
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import Image from 'next/image';
import { YelpMatchResponse } from "../../pages/api/restaurant-api";
import { StarRating } from '@components/Rating/Rating';


function SkeletonImage({ data }: { data: YelpMatchResponse }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <AspectRatio
            ratio={16 / 9}
            width="full"
        >
            <Skeleton isLoaded={imageLoaded} width="full" height="full">
                <Image
                    onLoad={() => setImageLoaded(true)}
                    alt={`${data?.name}`}
                    layout="fill"
                    src={`${data?.image_url}`}
                    objectFit='cover'
                />
            </Skeleton>
        </AspectRatio>
    );
}

export const RestaurantModal: React.FC<{
    isRestaurantOpen: any,
    onRestaurantClose: any,
    setError: any,
    setSuccess: any
}> = ({
    isRestaurantOpen,
    onRestaurantClose,
    setError,
    setSuccess
}): React.ReactElement => {
        // constants
        const countries = [
            { name: 'United States', code: 'US' },
            { name: 'Canada', code: 'CA' },
            { name: 'United Kingdom', code: 'UK' },
            { name: 'Spain', code: 'ES' },
            { name: 'Portugal', code: 'PT' },
            { name: 'Italy', code: 'IT' }
            // ...add other countries as needed
        ];


        // Form states
        const { colorMode } = useColorMode();

        const [showForm, setShowForm] = useState(true);
        const [name, setName] = useState('');
        const [address, setAddress] = useState('');
        const [city, setCity] = useState('');
        const [state, setState] = useState('');
        const [country, setCountry] = useState('');

        const [restaurant, setRestaurant] = useState<YelpMatchResponse>(null);

        const clearForm = () => {
            setName('');
            setAddress('');
            setCity('');
            setState('');
            setCountry('');
        }

        const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            try {
                const url = `${process.env.NEXT_PUBLIC_APP_URI}/api/restaurant-api?name=${name}&address=${address}&city=${city}&state=${state}&country=${country}`
                const response = await fetch(url);
                if (response.status === 200) {
                    const data: YelpMatchResponse = await response.json();
                    setShowForm(false);
                    setRestaurant(data);
                }
                else {
                    setError('Error searching for restaurant. Check inputs and try again.');
                }
            }
            catch (err) {
                console.error(err);
                if (err) {
                    setError(err?.message);
                }
            }
        };

        const addRestaurant = async () => {
            const options = {
                method: 'post',
                body: JSON.stringify(restaurant)
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URI}/api/restaurant/`, options);
            const data = await response.json();
            if (response.status === 200) {
                setSuccess(data);
                clearForm();
                onRestaurantClose();
                setRestaurant(null);
            } else {
                setError(data.message);
            }
        }


        return (
            <>
                <Modal isOpen={isRestaurantOpen} onClose={onRestaurantClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Add a restaurant</ModalHeader>
                        <ModalCloseButton />
                        {restaurant && !showForm ?
                            <VStack spacing={4} className="p-5" align="stretch">
                                <Box>
                                    <Button
                                        leftIcon={<ArrowBackIcon />}
                                        colorScheme={process.env.COLOR_THEME}
                                        onClick={() => setShowForm(true)}
                                    >
                                        Go Back
                                    </Button>
                                </Box>
                                <Flex>
                                    <SkeletonImage data={restaurant} />
                                </Flex>
                                <Heading>
                                    {restaurant?.name}
                                </Heading>
                                {
                                    restaurant?.location &&
                                    <VStack spacing={0} align='start'>
                                        <Heading as='h5' size='sm' className='m-0'>
                                            {restaurant?.location?.address1}
                                        </Heading>
                                        <Heading as='h5' size='sm' className='m-0'>
                                            {restaurant?.location?.city + ', ' + restaurant?.location?.country}
                                        </Heading>
                                    </VStack>
                                }
                                {
                                    restaurant.categories ?
                                        <HStack>
                                            <Text>Categories: {restaurant?.categories.map(x => x.title).join(', ')}</Text>
                                        </HStack> : ''
                                }
                                <Box display='flex' mt='2' alignItems='center'>
                                    <StarRating rating={restaurant?.rating} />
                                    <Box as='span' ml='2' color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize='sm'>
                                        {restaurant?.review_count} reviews
                                    </Box>
                                </Box>
                                <Flex align='flex-start'>
                                    <Button onClick={addRestaurant} width={'fit-content'} colorScheme={process.env.COLOR_THEME}>
                                        Add Restaurant
                                    </Button>
                                </Flex>
                            </VStack> :
                            <form onSubmit={handleSubmit}>
                                <FormControl className='px-3 py-3' isRequired>
                                    <VStack align='flex-start'>
                                        <FormLabel display={'flex'}>Name</FormLabel>
                                        <Input placeholder='Restaurant Name' value={name} onChange={e => setName(e.currentTarget.value)} />
                                    </VStack>
                                    <VStack mt='3' align='flex-start'>
                                        <FormLabel display={'flex'}>Country</FormLabel>
                                        <Select placeholder="Select country" value={country} onChange={e => {
                                            setCountry(e.currentTarget.value);
                                            setState('');
                                        }}>
                                            {countries.map((country, index) => (
                                                <option key={index} value={country.code}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </VStack>
                                    {
                                        ['US', 'CA'].includes(country) ?
                                            <>
                                                <VStack mt='3' align='flex-start'>
                                                    <FormLabel display={'flex'}>State</FormLabel>
                                                    <Input placeholder='MI' value={state} onChange={e => setState(e.currentTarget.value)} />
                                                </VStack>
                                                <VStack mt='3' align='flex-start'>
                                                    <FormLabel display={'flex'}>City</FormLabel>
                                                    <Input placeholder='Gotham' value={city} onChange={e => setCity(e.currentTarget.value)} />
                                                </VStack>
                                            </>
                                            :
                                            <>
                                                <VStack mt='3' align='flex-start'>
                                                    <FormLabel display={'flex'}>City</FormLabel>
                                                    <Input placeholder='Gotham' value={city} onChange={e => setCity(e.currentTarget.value)} />
                                                </VStack>
                                            </>
                                    }
                                </FormControl>
                                <FormControl className='px-3'>
                                    <VStack align='flex-start'>
                                        <FormLabel display={'flex'}>Street/Address</FormLabel>
                                        <Input placeholder='123 Main St' value={address} onChange={e => setAddress(e.currentTarget.value)} />
                                    </VStack>
                                </FormControl>
                                <Flex className='px-3 py-3' align='flex-start'>
                                    <HStack align='flex-end'>
                                        <Button
                                            type="submit"
                                            className="mt-2"
                                            colorScheme={process.env.COLOR_THEME}
                                        >
                                            Search
                                        </Button>
                                        <Button
                                            onClick={clearForm}
                                            className="mt-2"
                                            colorScheme={process.env.COLOR_THEME}
                                        >
                                            Clear
                                        </Button>
                                    </HStack>
                                </Flex>
                            </form>
                        }
                    </ModalContent>
                </Modal>
            </>
        )
    }
