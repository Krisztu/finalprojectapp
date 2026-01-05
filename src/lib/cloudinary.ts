

export const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbi2rvspr'
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'secondstyle'

    if (cloudName === 'demo') {
        console.warn('Cloudinary is running in demo mode. Uploads may fail. Please configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            throw new Error('Image upload failed')
        }

        const data = await response.json()
        return data.secure_url
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error)
        throw error
    }
}
