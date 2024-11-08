import {styled, Drawer as MuiDrawer} from '@mui/material'

const ResponsiveDrawer = styled(MuiDrawer)({
    position: "relative", //imp
    width: 240, //drawer width
    "& .MuiDrawer-paper": {
      width: 240, //drawer width
      position: "absolute", //imp
      transition: "none !important"
    }
})

export default ResponsiveDrawer;