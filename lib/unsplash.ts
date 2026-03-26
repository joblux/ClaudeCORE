import { createApi } from 'unsplash-js'

let unsplashClient: ReturnType<typeof createApi> | null = null

export function getUnsplash() {
  if (!unsplashClient) {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      throw new Error('UNSPLASH_ACCESS_KEY is not set')
    }
    unsplashClient = createApi({ accessKey })
  }
  return unsplashClient
}

export interface UnsplashImage {
  id: string
  url: string
  thumb: string
  alt: string | null
  width: number
  height: number
  photographer: string
  photographer_url: string
  unsplash_url: string
  download_location: string
}

export function mapUnsplashPhoto(photo: any): UnsplashImage {
  return {
    id: photo.id,
    url: photo.urls.regular,
    thumb: photo.urls.small,
    alt: photo.alt_description,
    width: photo.width,
    height: photo.height,
    photographer: photo.user.name,
    photographer_url: photo.user.links.html,
    unsplash_url: photo.links.html,
    download_location: photo.links.download_location,
  }
}
