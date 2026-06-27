/**
 * 바이럴 소재 수집: YouTube Data API로 한국 인기 영상 중 임베드 가능한 것을 가져온다.
 * Claude가 실제 영상 ID를 임베드하도록 후보를 JSON으로 출력.
 *
 * YouTube API 키 발급: https://console.cloud.google.com → YouTube Data API v3 사용 설정 → API 키
 * 실행: YOUTUBE_API_KEY=xxx node scripts/fetch-viral.mjs > scripts/viral-candidates.json
 */

const KEY = process.env.YOUTUBE_API_KEY

async function run() {
  if (!KEY) {
    process.stdout.write('[]')
    return
  }

  const url =
    'https://www.googleapis.com/youtube/v3/videos' +
    '?part=snippet,status,contentDetails' +
    '&chart=mostPopular&regionCode=KR&maxResults=25&hl=ko' +
    `&key=${KEY}`

  const res = await fetch(url)
  if (!res.ok) {
    process.stderr.write(`YouTube API 오류 ${res.status}\n`)
    process.stdout.write('[]')
    return
  }

  const json = await res.json()
  const items = (json.items || [])
    .filter(v => v.status?.embeddable !== false)               // 임베드 가능한 것만
    .filter(v => v.contentDetails?.contentRating?.ytRating !== 'ytAgeRestricted') // 연령제한 제외
    .filter(v => v.snippet?.categoryId !== '10')               // 뮤직비디오 제외 (스토리성 위주)
    .map(v => ({
      youtube_id: v.id,
      title: v.snippet.title,
      channel: v.snippet.channelTitle,
      description: (v.snippet.description || '').slice(0, 300),
      categoryId: v.snippet.categoryId,
    }))
    .slice(0, 10)

  process.stdout.write(JSON.stringify(items, null, 2))
}

run()
