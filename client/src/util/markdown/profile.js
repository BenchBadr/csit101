import {useEffect, useState} from 'react';
import { Tooltip } from '../integr/wikipedia';

const TooltipProfile = ({match}) => {
    return (
        <a 
    style={{color:'var(--main)',fontWeight:'500'}}
    href={`/@${match}`}
    >@{match}</a>
    )
}

export default TooltipProfile;