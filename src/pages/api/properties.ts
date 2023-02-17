// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export type PropertyMetaData = {
  status: boolean
  price?: number
  zipCode?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PropertyMetaData>
) {
  const resData = await fetch(
    req.query.url as string
  ).then((response) => response.text()).then(result => {
    const startIndex = result.indexOf("window.PAGE_MODEL = ") + 20
    const endIndex = result.indexOf("</script>", startIndex)
    const propertyData = JSON.parse(result.substring(startIndex, endIndex)).propertyData
    if(propertyData){
      const price =parseFloat(propertyData.prices.primaryPrice.replace(/\D/g, ''))
      return {
        "status": true,
        "price": price,
        "zipCode": propertyData.address.outcode+' '+propertyData.address.incode
      }
    }
    return {"status": false}
  });

  res.status(200).json(resData)
}
