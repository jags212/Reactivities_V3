import { Person } from "@mui/icons-material";
import { Box, Card, CardContent, CardMedia, Chip, Divider, Typography } from "@mui/material";
import { Link } from "react-router";

type Props = {
    profile : Profile
}


export default function ProfileCard({ profile }: Props) {
  const following = false;

  return (
    <Link to={`/profiles/${profile.id}`} style={{ textDecoration: 'none' }}>
      <Card elevation={4} sx={{ borderRadius: 3, p:3, maxWidth:300, textDecoration: 'none' }}>
       <CardMedia component="img" 
              image={profile.imageUrl || 'images/user.png'} 
              alt={profile.displayName + ' image'} 
              sx={{width: 200, zIndex:50}}/>
       <CardContent>
           <Box display='flex' alignItems='center' gap={1}>
               <Typography variant='h5'>{profile.displayName}</Typography>
               {following && <Chip size="small" label="Following" color="secondary" variant="outlined" />}
           </Box>
       </CardContent>
       <Divider sx={{ mb: 2 }} />
       <Box sx={{display:'flex', justifyContent:'start', alignItems:'center'}}>
           <Person />
           <Typography sx={{ ml: 1 }}>
               20 Followers
           </Typography>
       </Box>
      </Card>
    </Link>
  )
}
