"use client";

import React, {useState, useEffect} from "react";

const examplePostPage = ({params}) => {
  const [comments,setComments] = useState(null)
  const [post, setPost] = useState(null)

  const fetchPostComments = async () => {
    const commentsResponse = await fetch(`http://localhost:8000/api/postcomments/${post.postid}`)
    const jsonData = await commentsResponse.json()
    console.log(jsonData)
    setComments(jsonData)
  }

  const fetchPost = async () => {
    const postResponse = await fetch(`http://localhost:8000/api/posts/${params.post}`)
    const jsonData = await postResponse.json()
    setPost(jsonData)

    await fetchPostComments()
  }

  const getAllData = async () => {
    fetchPost().then(
      fetchPostComments()
    )
  }


  useEffect(() => {
    getAllData()
  }, [])

  return (
    <main>
      <h1>Post {params.post}</h1>
      {post && <h2>{post.content}</h2>}
    </main>
  )
}

export default examplePostPage 
