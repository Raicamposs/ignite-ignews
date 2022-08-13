


import * as prismic from '@prismicio/client'
import * as prismicNext from '@prismicio/next'


/**
 * The project's Prismic repository name.
 */
export const repositoryName = prismic.getRepositoryName(process.env.PRISMIC_ENDPOINT)


/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config {prismicNext.CreateClientConfig} - Configuration for the Prismic client.
 */
export const getPrismicClient = (config: any = {}) => {
  const client = prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    ...config
  })

  prismicNext.enableAutoPreviews({
    client,
    previewData: config?.previewData,
    req: config?.req,
  })

  return client
}
