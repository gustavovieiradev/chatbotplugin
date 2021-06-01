import { Box, Flex, Icon, IconButton, Input, Stack, Text } from '@chakra-ui/react'
import { GetServerSideProps } from "next";
import { query as q } from 'faunadb';
import {RiChatSmile2Line, RiSendPlaneFill} from 'react-icons/ri'
import {FiSend} from 'react-icons/fi'
import { useState } from 'react'
import { api } from '../services/api';
import { fauna } from '../services/fauna';

interface Message {
  message: string;
  sender: 'user' | 'bot'
}

type ChatFormData = {
  title: string;
  theme: string;
}

interface ChatProps {
  data: ChatFormData;
}

export default function Home({data}: ChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  function handleOpenChat() {
    setIsOpen(!isOpen);
  }

  async function handleSendMessage() {
    try {
      const response = await api.post('/conversation', {message});
      const result = response.data;

      console.log(result);
      
      setMessages([...messages, {
        message,
        sender: 'user'
      }, {
        message: result.data.text_output,
        sender: 'bot'
      }])

    } catch (err) {
      setMessages([...messages, {
        message: 'Não encontramos nenhuma mensagem',
        sender: 'bot'
      }])
    }
    

  }

  return (
    <Flex height="800px" justify="flex-end" direction="column">
      {isOpen && (
        <Flex justify="flex-end" align="end">
          <Box position="relative">
            <Flex as="header" bg={data.theme} height="75" width="310px" borderTopRadius="10" align="center" px="5">
              <Text color="white" fontSize="20">{data.title}</Text>
            </Flex>
            <Box bg="white" h="600" borderBottomRadius="10" overflowX="hidden" overflowY="auto">
              <Stack spacing="2" p="2" >
                {messages.map((message, key) => (
                  <Flex justify={message.sender === 'user' ? 'flex-end' : 'flex-start'} key={key+2}>
                    <Text 
                      width="200px" 
                      borderRadius="10" 
                      p="2" 
                      bg={message.sender === 'user' ? data.theme : 'gray.200'} 
                      color={message.sender === 'user' ? 'white' : 'black'} 
                      fontSize="sm">
                      {message.message}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </Box>
            <Box position="absolute" bottom="0" w="100%" bg="white">
              <Flex borderTopWidth="1px" borderColor="gray.400" p="3" align="center"  borderTopRadius="10">
                <Input variant="unstyled" onChange={(ev) => setMessage(ev.target.value)} />
                <IconButton
                  colorScheme={data.theme === 'black' ? 'blackAlpha' : data.theme}
                  aria-label="Call Segun"
                  size="sm"
                  fontSize="20"
                  onClick={handleSendMessage}
                  icon={<Icon as={FiSend} />} />
              </Flex>
            </Box>
          </Box>
        </Flex>
      )}
      <Flex direction="row" justify="flex-end" align="end" mt="5">
        <IconButton
          float="right"
          colorScheme={data.theme === 'black' ? 'blackAlpha' : data.theme}
          aria-label="Call Segun"
          size="lg"
          fontSize="30"
          onClick={handleOpenChat}
          icon={<Icon as={RiChatSmile2Line} />}
        />
      </Flex>
    </Flex>
  )
}

export const getServerSideProps: GetServerSideProps = async({params}) => {
  const { id } = params;
  const response: any = await fauna.query(
    q.Get(
      q.Match(
        q.Index('ix_config_id_project'),
        id
      )
    )
  )

  const config = response.data;



  return {
    props: {
      data: (config && config.title) ? config : {
        title: 'Bem-vindo - HMG',
        theme: 'teal'
      }
    }
  }
}