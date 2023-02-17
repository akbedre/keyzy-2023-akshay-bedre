import Head from 'next/head'
import { useState, useEffect } from 'react'
import { PropertyMetaData } from './api/properties'
import { Button, Slider } from '@mui/material';
export default function Home() {

  const [url, setUrl] = useState('https://www.rightmove.co.uk/properties/130774457#')
  const [price, setPrice] = useState(0)
  const [zipCode, setZipCode] = useState('')
  const [showNoResult, setShowNoResult] = useState(true)

  const [discount, setDiscount] = useState(15)
  const [convertedRentRate, setConvertedRentRate] = useState(20)
  const [desiredYield, setDesiredYield] = useState(6)
  const [duration, setDuration] = useState(5)

  const [targetPrice, setTargetPrice] = useState(0)
  const [totalMonthlyRental, setTotalMonthlyRental] = useState(0)
  const [rent, setRent] = useState(0)
  const [convertedRent, setConvertedRent] = useState(0)
  const [futureBuyBack, setFututreBuyBack] = useState(0)

  const [errorMessage, setErrorMessage] = useState('')
  const hideError = () => {
    setShowNoResult(false)
    setErrorMessage("")
  }
  const showError= (message:string) => {
    setShowNoResult(true)
    setErrorMessage(message)
  }
  useEffect(() => {

    if (url != '') {
      // validate URL
      const pattern = new URLPattern('https://www.rightmove.co.uk/properties/(\\d+)')
      if (!pattern.test(url)) {
        showError("Invalide url")
        return
      }
      const hasPound = url.charAt(url.length - 1) === '#'
      if (!hasPound) {
        showError("'#' missing at the end of the URL")
        return
      }
      hideError()
      fetch('/api/properties?url=' + encodeURIComponent(url))
        .then((res) => res.json())
        .then((data: PropertyMetaData) => {
          setShowNoResult(!data.status)
          setPrice(data.price || 0)
          setZipCode(data.zipCode || '')
          if (!data.status) {
            showError("Couldn't find the property. Please check the URL")
          }
        })
        .catch(reason => {
          showError("Couldn't find the property. Please check the URL")
        })

    }

  }, [url])

  useEffect(() => {
    setErrorMessage("")
    setShowNoResult(true)
    // Validate inputs
    if (desiredYield < 4.5 || desiredYield > 9) {
      showError("Desired yield must be between 4.5% - 9%")
    }
    else if (price > 0) {
      hideError()
      const _targetPrice = price * (1 - discount / 100)
      const _rent = _targetPrice / 12 * desiredYield / 100
      const _convertedRent = _targetPrice / 12 * desiredYield / 100 * convertedRentRate / 100
      setTargetPrice(_targetPrice)
      setRent(_rent)
      setConvertedRent(_convertedRent)
      setTotalMonthlyRental(_rent + _convertedRent)
      setFututreBuyBack(_targetPrice - (_convertedRent * duration * 12))
    }
  }, [price, discount, desiredYield, convertedRentRate, duration])
  const valuetext = (value: number) => {
    return `${value}%`;
  }
  const formatter = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).resolvedOptions().maximumFractionDigits

  const convertToCurrency = (value: Number) => {
    return (value).toLocaleString('en-UK', {
      maximumFractionDigits: formatter
    });
  }
  return (
    <>
      <Head>
        <title>Keyzy Technical Assignment</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Keyzy_-_Logo.png" />
      </Head>
      <div className='lg:flex flex-row p-10'>
        <div className=' lg:max-w-[50%] flex grow flex-col pr-10' >
          <div className='flex'>
            <p className='text-lg font-bold'>Inputs</p>
          </div>
          <div className='flex flex-row mt-10'>
            <div className='basis-1/4'>
              <p >URL</p>
            </div>
            <div className='grow'>
              <input inputMode='url' className='w-full' value={url} onChange={event => setUrl(event?.target.value)}></input>
            </div>
          </div>
          <div className='flex flex-row mt-10'>
            <div className='basis-1/4 whitespace-normal pr-3'>
              Discount vs. asking price
            </div>
            <div className='grow'>
              <Slider
                value={discount}
                track={false}
                min={0}
                max={30}
                valueLabelDisplay="on"
                getAriaValueText={valuetext}
                defaultValue={15}
                marks={[{
                  value: 0,
                  label: '0%',
                }, {
                  value: 30,
                  label: '30%',
                }
                ]}
                onChange={(event: Event, newValue: number | number[]) => setDiscount(newValue as number)}
              />
            </div>
          </div>
          <div className='flex flex-row mt-10'>
            <div className='basis-1/4 whitespace-normal pr-3'>
              Desired yield
            </div>
            <div className='grow'>
              <input
                value={desiredYield}
                type='number'
                min={4.5}
                max={9}
                step={0.5}
                onChange={event => setDesiredYield(Number(event?.target.value))}
              />%
            </div>
          </div>
          <div className='flex flex-row mt-10'>
            <div className='basis-1/4 whitespace-normal pr-3'>
              Converted rent rate
            </div>
            <div className='grow'>
              <Slider
                value={convertedRentRate}
                track={false}
                min={10}
                max={25}
                step={5}
                valueLabelDisplay="on"
                getAriaValueText={valuetext}
                defaultValue={15}
                marks={[{
                  value: 10,
                  label: '10%',
                }, {
                  value: 25,
                  label: '25%',
                }
                ]}
                onChange={(event: Event, newValue: number | number[]) => setConvertedRentRate(newValue as number)}
              />
            </div>
          </div>
          <div className='flex flex-row mt-10'>
            <div className='basis-1/4 whitespace-normal pr-3'>
              Duration
            </div>
            <div className='grow'>
              <div className='flex space-x-1'>
                <button onClick={() => setDuration(3)} className={`bg-azure text-col text-white p-2 basis-1/3 ${duration === 3 ? 'font-bold' : ''}`}>3 years</button>
                <button onClick={() => setDuration(5)} className={`bg-azure text-col text-white p-2 basis-1/3 ${duration === 5 ? 'font-bold' : ''}`}>5 years</button>
                <button onClick={() => setDuration(7)} className={`bg-azure text-col text-white p-2 basis-1/3 ${duration === 7 ? 'font-bold' : ''}`}>7 years</button>
              </div>

            </div>
          </div>
        </div>
        {!showNoResult && (
          <div className='flex flex-col grow pr-3' >
            <div className='flex'>
              <p className='text-lg font-bold'>Data Retrieved</p>
            </div>
            <div className="table table-fixed">
              <div className="table-row">
                <div className="table-cell pt-10">Listing price</div>
                <div className="table-cell w-1">£</div>
                <div className="table-cell w-1">{convertToCurrency(price)}</div>
              </div>
              <div className="table-row">
                <div className="table-cell pt-5">Post code</div>
                <div className="table-cell w-1"></div>
                <div className="table-cell ">{zipCode}</div>
              </div>
              <div className="table-row">
                <p className='text-lg table-cell pt-10 font-bold'>Outputs</p>
              </div>
              <div className="table-row">
                <div className="table-cell pt-5">Target price</div>
                <div className="table-cell w-1">£</div>
                <div className="table-cell ">{convertToCurrency(targetPrice)}</div>
              </div>
              <div className="table-row">
                <div className="table-cell pt-5">Total monthly rental</div>
                <div className="table-cell w-1">£</div>
                <div className="table-cell text-right ">{convertToCurrency(totalMonthlyRental)}</div>
              </div>
              <div className="table-row">
                <div className="table-cell pt-1 pl-6">Rent</div>
                <div className="table-cell w-1">£</div>
                <div className="table-cell text-right ">{convertToCurrency(rent)}</div>
              </div>
              <div className="table-row">
                <div className="table-cell pt-1 pl-6">Converted rent</div>
                <div className="table-cell w-1">£</div>
                <div className="table-cell text-right ">{convertToCurrency(convertedRent)}</div>
              </div>
              <div className="table-row">
                <div className="table-cell pt-5">Future buy-back price</div>
                <div className="table-cell w-1">£</div>
                <div className="table-cell text-right ">{convertToCurrency(futureBuyBack)}</div>
              </div>
            </div>
          </div>
        )}
        {showNoResult && (
          <div className='flex flex-col grow pr-3' >
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
      <div className="hidden md:max-lg:block  absolute inset-x-0 top-0 w-full">
        <div className="semi-bold m-2 mx-auto w-2/3 rounded border-red-700 bg-red-400 p-4 text-center text-white leading-5">
          Not tablet friendly - please use mobile or desktop device.
        </div>
      </div>

    </>
  )
}