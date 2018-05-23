const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const Pusher = require('pusher')
const countryData = require('country-data')
const dialogflow = require('dialogflow')
const NewsAPI = require('newsapi')
const newsapi = new NewsAPI('enter your news API token')

const projectId = 'news-42175'
const sessionId = 'a-random-session-id'
const languageCode = 'en-US'

const sessionClient = new dialogflow.SessionsClient()
const sessionPath = sessionClient.sessionPath(projectId, sessionId)

const countryDataByName = countryData.countries.all.reduce((acc, curr) => {
  acc[curr.name.toLowerCase()] = curr
  return acc
}, {})

const buildQuery = function (query) {
  return {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode
      }
    }
  }
}

const fetchNews = function (intentData) {
  const {category = {}} = intentData
  const geoCountry = intentData['geo-country']
  // const sourceString = source.listValue.values.map(value => value.stringValue.toLowerCase())

  return newsapi.v2.topHeadlines({
    // sources: sourceString.join(','),
    category: category.stringValue,
    language: 'en',
    country: countryDataByName[geoCountry.stringValue.toLowerCase()] ? countryDataByName[geoCountry.stringValue.toLowerCase()].alpha2 : 'us'
  })
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const port = process.env.PORT || 8080

const pusher = new Pusher({
  appId: 'app_id',
  key: 'key',
  secret: 'secret',
  cluster: 'cluster',
  encrypted: true
})

app.post('/message', function (req, res) {
  return sessionClient
  .detectIntent(buildQuery(req.body.message))
  .then(responses => {
    console.log('Detected intent')
    const result = responses[0].queryResult
    const intentData = responses[0].queryResult.parameters.fields

    if (result.intent) {
      fetchNews(intentData)
      .then(news => news.articles)
      .then(articles => pusher.trigger('news', 'news-update', articles.splice(0, 6)))
      .then(() => console.log('published to pusher'))
    } else {
      console.log(`  No intent matched.`)
    }
    return res.sendStatus(200)
  })
  .catch(err => {
    console.error('ERROR:', err)
  })
})

app.listen(port, function () {
  console.log('Node app is running at localhost:' + port)
})
