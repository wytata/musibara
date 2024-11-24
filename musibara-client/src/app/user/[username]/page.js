"use client";

import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { usePathname, useParams } from "next/navigation";
import { DataContext } from "@/app/layout";

const Page = () => {
  const router = useRouter();
  const { username } = useParams(); // Access dynamic route parameter
  const { userData, retrieveUserInfo } = useContext(DataContext);

  const [viewedUser, setViewedUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch(`${apiUrl}/api/users/byname`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
  
        if (userResponse.ok) {
          const data = await userResponse.json();
          setViewedUser(data);
        } else {
          console.error("Failed to fetch user data:", userResponse.statusText);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    // Fetch current user information
    retrieveUserInfo();
  
    // Redirect if the username matches the logged-in user
    if (userData?.username === username) {
      router.push("/profile");
    } else {
      fetchUserData();
    }
  }, [username, userData]);
  

  if (userData?.username === username) {
    return null; // Prevent rendering while redirecting
  }

  return (
<Suspense>
    <Grid2 container direction="column" spacing={3} style={{ padding: '20px' }}>
      <Grid2 item xs={12}>
        <Card style={{ borderRadius: '1rem' }}>
          <CardContent style={{ textAlign: 'center', fontFamily: 'Cabin' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Avatar
                alt={viewedUser && viewedUser.username}
                src={viewedUser && viewedUser.avatar}
                variant="rounded"
                sx={{ width: '25%', height: 'auto', maxHeight: '200px', marginRight: '0', margin: '0 10px', borderRadius: '1rem' }}
              />
              <Avatar
                alt={viewedUser && viewedUser.name}
                src={viewedUser && viewedUser.banner}
                variant="rounded"
                sx={{ width: '70%', height: 'auto', maxHeight: '200px', margin: '0 10px', borderRadius: '1rem' }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="h3" style={{ marginTop: '10px', fontFamily: 'Cabin', fontWeight: 'bolder' }}>
                  {viewedUser && viewedUser.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" style={{fontFamily: 'Cabin'}}>
                  @{viewedUser && viewedUser.username}
                </Typography>
                <Typography variant="body1" style={{ marginTop: '10px', fontFamily: 'Cabin' }}>
                  {viewedUser && viewedUser.bio}
                </Typography>
              </Box>
              <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    herds
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      {viewedUser?.herdcount}
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    followers
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      {viewedUser?.followercount}
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    following
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      {viewedUser?.followingcount}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 item xs={12}>
        <Card style={{ borderRadius: '1rem' }}>
          <CardContent>
            <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ '& .MuiTabs-indicator': { backgroundColor: '#264653' } }}>
              <Tab label="Posts" style={{ fontFamily: 'Cabin', color: '#264653' }} />
              <Tab label="Playlists" style={{ fontFamily: 'Cabin', color: '#264653' }} />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <List>
                {userPosts && userPosts.map(post => (
                  <PostItem key={post.postid} post={post} />))
                }
              </List>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" style={{ fontFamily: 'Cabin' }}>Playlists</Typography>
                <IconButton
                  onClick={handleOpenDialog}
                  sx={{
                    backgroundColor: 'transparent',
                    color: 'black',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <List sx={{display: 'flex', flexWrap: 'wrap', gap: '16px', width: '70vw', maxWidth: '100%', alignItems: 'center', borderRadius: '1rem', padding: '0 8px', marginTop: '5px'}}>
                {viewedUser && playlists && playlists.map((playlist) => (
                  <ListItem key={playlist.playlistid} sx={{padding: '0', width: 'fit-content'}}>
                    <Card sx={{borderRadius: '1rem', margin: '0 auto', width: 'fit-content', height: '300px', backgroundColor: '#e6eded', }}>
                      <Link href={`/playlist/${playlist.playlistid}`}>
                        <CardActionArea>
                          <CardMedia
                            component="img"
                            height="140"
                            sx={{borderRadius: '1rem', padding: '5px', margin: '5px', width: '240px', height: '240px'}}
                            image={'Logo.png'}
                            alt={`Image for playlist ${playlist.name}`}
                          />
                        </CardActionArea >
                      </Link>
                    </Card>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
    </Suspense>
  );
};

export default Page;
