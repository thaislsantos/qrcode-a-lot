import React, { useState } from 'react'
import QRCode from 'react-qr-code'
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import slugify from 'slugify'

import {
  Button,
  Grid,
  TextField,
  Typography
} from '@mui/material'

const App = () => {
  const [content, setContent] = useState('')
  const [download, setDownload] = useState(false)

  const getImagesBase64 = () => new Promise((resolve, reject) => {
    const imagesBase64 = []
    const images = document.querySelectorAll('svg')
    let convert = 0

    content.split('\n').forEach((line, i) => {
      const image = images[i]

      toPng(image)
        .then(function (dataUrl) {
          console.log(dataUrl)
          convert++

          imagesBase64.push({
            name: `qrcode-${slugify(line)}.png`,
            base64: dataUrl,
          })

          if (convert === images.length) {
            resolve(imagesBase64)
          }
        })
        .catch(function (error) {
          console.error('oops, something went wrong!', error)
        })
    })
  })

  const saveToZip = (zipName, images) => {
    const zip = new JSZip()

    images.forEach(image => {
      zip.file(image.name, image.base64.split('base64,')[1], { base64: true })
    })
    
    zip.generateAsync({ type: 'blob' })
    .then(function(content) {
      saveAs(content, `${zipName}.zip`)
    })
  }

  const handleDownload = () => {
    setDownload(true)

    setTimeout(async () => {
      const images = await getImagesBase64()
      saveToZip('qr-codes', images)
    }, 100)
  }

  return (
    <Grid container gap={4} direction='column' alignItems='center'>
      <Grid item>
        <Typography variant='h1' align='center'>
          QRCode A Lot
        </Typography>
      </Grid>
      <Grid item>
        <TextField
          style={{ maxWidth: '100%', width: '800px' }}
          multiline
          label='Um QRCode por Linha'
          placeholder='http://....
http://....'
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </Grid>
      <Grid item>
        <Button variant='contained' size='large' onClick={handleDownload}>Baixar QRCodes</Button>
      </Grid>

      {download && (
        <Grid item>
          <Typography variant='h3' align='center'>
            Comprimindo os códigos para download
          </Typography>
        </Grid>
      )}
      
      {content !== '' && (
        <Grid container gap={2} alignItems='center'>
          {content.split('\n').map((line, i) => (
            <Grid item key={`qr-${i}`}>
              <QRCode value={line} />
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  )
}

export default App
