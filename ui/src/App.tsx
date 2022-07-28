import React, { useRef, useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'

import {
  Button,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  FormErrorMessage,
  Code,
  Icon,
} from '@chakra-ui/react'
import { FcDataSheet } from 'react-icons/fc'

import { GET_BUGS, Bugs } from './graphql'

import './App.css'
import { ParseWorker } from './serviceWorker'
import { ParseEvent } from './worker'

type ParserFunction = (file: File) => Promise<void>

function App({
  noBugs = '🚫🐛',
  parseWorker,
}: {
  noBugs?: string
  parseWorker: ParseWorker
}) {
  const inFile = useRef<HTMLInputElement>(null)
  const [filename, setFilename] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [parserStatus, setParserStatus] = useState<ParseEvent>()

  const handleMessages = (msg: any) => {
    if (typeof msg.data === 'object' && msg.data.type === 'ParseEvent') {
      setParserStatus(msg.data)
    }
  }
  useEffect(() => {
    parseWorker.addEventListener('message', handleMessages)

    return () => {
      parseWorker.removeEventListener('message', handleMessages)
    }
  }, [])

  const onFileChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length === 1) {
      setFile(e.target.files[0])
      setFilename(e.target.files[0].name)
    } else {
      setFile(null)
      setFilename('')
    }
  }

  const invalid = false
  return (
    <div className="App">
      <header className="App-header">
        <p>Safe Input PoC</p>
      </header>
      <main>
        <FormControl isInvalid={Boolean(invalid)} isRequired={false}>
          <FormLabel htmlFor="writeUpFile"></FormLabel>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              children={<Icon as={FcDataSheet} />}
            />
            <input
              type="file"
              ref={inFile}
              onChange={onFileChanged}
              disabled={parserStatus && parserStatus.state === 'LOADING'}
              accept="
            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
            application/vnd.ms-excel,
            .xlsb
          "
              style={{ display: 'none' }}
            />
            <Input
              placeholder="Choose a spreadsheet to upload"
              onClick={() => inFile && inFile.current && inFile.current.click()}
              readOnly
              value={filename}
            />
          </InputGroup>
          <FormErrorMessage>{invalid}</FormErrorMessage>
        </FormControl>
        <br />
        <br />
        <Button
          disabled={
            file === null || (parserStatus && parserStatus.state === 'LOADING')
          }
          onClick={() => file && parseWorker.parse(file)}
        >
          Prepare
        </Button>
        <br />
        <br />
        {!parserStatus && <p>No parsing status</p>}
        {parserStatus && parserStatus.state === 'LOADING' && (
          <p>Preparing data for upload...</p>
        )}
        {parserStatus && parserStatus.state === 'DONE' && (
          <div>
            <h3>Data ready for upload.</h3>
            <h4>JSON</h4>
            <pre>{JSON.stringify(parserStatus.sheets, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
