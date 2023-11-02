import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  useToast,
  VStack,
  Select,
  HStack
} from '@chakra-ui/react';
import React, { FormEvent, useEffect, useState } from 'react';

import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import { useQueryClient } from '@tanstack/react-query';
import RestaurantModal from '../RestaurantModal';
import BookModal from '@components/BookModal';
import MovieModal from '@components/MovieModal';

export const ModalHub: React.FC<{ inMobileNav?: boolean, isHubOpen?: any, onHubOpen?: any, onHubClose?: any }> = ({
  inMobileNav = false,
  isHubOpen,
  onHubOpen,
  onHubClose
}): React.ReactElement => {

  const [error, setError] = useState(``);
  const [success, setSuccess] = useState<{ type: string; data: any } | null>(
    null
  );


  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isRestaurantOpen, onOpen: onRestaurantOpen, onClose: onRestaurantClose } = useDisclosure();
  const { isOpen: isBookOpen, onOpen: onBookOpen, onClose: onBookClose } = useDisclosure();

  const queryClient = useQueryClient();
  const toast = useToast();

  const [selection, setSelection] = useState('');
  const options = [
    { type: 'Movie' },
    { type: 'Restaurant' },
    { type: 'Book' }
  ]

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onClose();
    if (selection === 'Movie') {
      onOpen();
    }
    else if (selection === 'Restaurant') {
      onRestaurantOpen();
    }
    else if (selection === 'Book') {
      onBookOpen();
    }
    onHubClose();
    setSelection('');
  }

  useEffect(() => {
    if (success) {
      if (success?.type === 'addition' && success?.category === 'movie') {
        queryClient.invalidateQueries({ queryKey: [`movies`] });
      }
      else if (success?.type === 'addition' && success?.category === 'restaurant') {
        queryClient.invalidateQueries({ queryKey: [`restaurants`] });
      }
      else if (success?.type === 'addition' && success?.category === 'book') {
        queryClient.invalidateQueries({ queryKey: [`books`] });
      }
      else {
        queryClient.invalidateQueries({ queryKey: [`movies`] });
        queryClient.invalidateQueries({ queryKey: [`restaurants`] });
        queryClient.invalidateQueries({ queryKey: [`books`] });
      }

      let toastHeader = 'Item'
      if (success?.category === 'movie') {
        toastHeader = 'Movie';
      }
      else if (success?.category === 'restaurant') {
        toastHeader = 'Restaurant';
      }
      else if (success?.category === 'book') {
        toastHeader = 'Book';
      }
      toast({
        variant: `subtle`,
        title: success.type === `addition` ? `${toastHeader} Added` : `${toastHeader} Deleted`,
        description:
          success.type === `addition`
            ? `${success.data?.name ?? success.data?.title} was successfully added`
            : `${success.data?.name ?? success.data?.title} was successfully deleted`,
        status: `success`,
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setSuccess(null);
    } else if (error) {
      toast({
        variant: `subtle`,
        title: `There was an error`,
        description: error,
        status: `error`,
        duration: 5000,
        isClosable: true,
      });
      setSuccess(null);
      setError('');
    }
  }, [success, error, onClose, queryClient, toast]);

  interface FormFields {
    0: HTMLInputElement;
  }


  return (
    <>
      {!inMobileNav &&
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label='Options'
            icon={<AddIcon />} variant='ghost'
          >
            Open menu
          </MenuButton>
          <MenuList>
            <MenuItem onClick={onOpen}>Add Movie</MenuItem>
            <MenuItem onClick={onRestaurantOpen}>Add Restaurant</MenuItem>
            <MenuItem onClick={onBookOpen}>Add Book</MenuItem>
          </MenuList>
        </Menu>
      }
      <Modal isOpen={isHubOpen} onClose={onHubClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <FormControl>
                <VStack mt='3' align='flex-start'>
                  <FormLabel display={'flex'}>Select Option</FormLabel>
                  <Select placeholder="Select option" value={selection} onChange={e => {
                    setSelection(e.currentTarget.value);
                  }}>
                    {options.map((option, index) => (
                      <option key={index} value={option.type}>
                        {option.type}
                      </option>
                    ))}
                  </Select>
                </VStack>
                <Flex className='py-3' align='flex-start'>
                  <HStack align='flex-end'>
                    <Button
                      type="submit"
                      className="mt-2"
                      colorScheme={process.env.COLOR_THEME}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </FormControl>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
      <MovieModal isOpen={isOpen} onClose={onClose} setError={setError} setSuccess={setSuccess} error={error} />
      <RestaurantModal isRestaurantOpen={isRestaurantOpen} onRestaurantClose={onRestaurantClose} setError={setError} setSuccess={setSuccess} />
      <BookModal isBookOpen={isBookOpen} onBookClose={onBookClose} setError={setError} setSuccess={setSuccess} />
    </>
  )
};
