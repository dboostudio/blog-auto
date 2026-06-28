/**
 * 유튜브 임베드 (공식 iframe — 저작권 안전)
 * MDX에서 <YouTube id="VIDEO_ID" /> 형태로 사용
 */
export function YouTube({ id, title }: { id: string; title?: string }) {
  // 유튜브 영상 ID 형식만 허용 (URL/쿼리 주입 방지)
  if (!id || !/^[\w-]{11}$/.test(id)) return null
  return (
    <div className="my-6 relative w-full overflow-hidden rounded-lg" style={{ paddingTop: '56.25%' }}>
      <iframe
        className="absolute inset-0 w-full h-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title || 'YouTube video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
