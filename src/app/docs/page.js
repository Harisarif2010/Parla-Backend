import React from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function DocsPage () {
  return (
      <div><h2>Swagger API Docs</h2>
          <SwaggerUI url='../swagger.json' />
      </div>
  )
}
