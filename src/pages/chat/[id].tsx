import { Box, Flex, Icon, IconButton, Input, Stack, Text } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { query as q } from 'faunadb';
import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { api } from "../../services/api";
import { fauna } from "../../services/fauna";

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

export default function Chat({data}: ChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  async function handleSendMessage() {
    try {
      const response = await api.post('/conversation', { message });
      const result = response.data;

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
    <Box width="100vw" h="100vh" bg="white">
      <Flex h="72px" w="100%" bg={data.theme} borderBottomRadius="20" align="center">
        <Text color="white" px="5" fontSize="20">{data.title}</Text>
      </Flex>
      <Box bg="white" height="100%">
        <Stack spacing="2" p="2" >
          {messages.map((message, key) => (
            <Flex justify={message.sender === 'user' ? 'flex-end' : 'flex-start'} key={key + 2}>
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
      <Box position="absolute" bottom="0" w="100%">
        <Flex borderTopWidth="1px" borderColor="gray.400" p="3" align="center" borderTopRadius="10">
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