import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { colorAccent, colorAccentHover, colorAccentPress, colorBlack, colorBlackHover, colorDisabledBackground, colorDisabledText, colorGreen, colorGreyBorder, colorGreyHover, colorGreyPopupBackground, colorIconButtonPress, colorLightBlueBackground, colorLightGreen, colorNearBlack, colorPink, colorPinkHover, colorPinkPress, colorPrimaryPress, colorPurpleBackground, colorRed, colorSecondaryPress, colorTextBlue, colorTextGrey, colorWhite } from "./color";
import { EditorialHeading, Paragraph, UtilityText } from "./text";
import { HoverView, Pad, PadBox } from "./basics";
import { IconChevronDown, IconChevronUpSmall, IconChevronUp, IconCircleCheck, IconSwitchOff, IconSwitchOn, IconChevronDownSmall } from "./icon";
import { FacePile } from "./people";
import { Popup } from "../platform-specific/popup";
import { closeActivePopup } from "../platform-specific/popup";



export function CTAButton({label, icon, type='primary', disabled, compact=false, onPress}) {
    const s = CTAButtonStyle;

    const styleMap = {
        primary: {normal: s.primary, hover: s.primaryHover, pressed: s.primaryPressed, textColor: colorWhite}, 
        secondary: {normal: s.secondary, hover: s.secondaryHover, pressed: s.secondaryPressed, textColor: colorBlack},
        accent: {normal: s.accent, hover: s.accentHover, pressed: s.accentPressed, textColor: colorWhite},
        disabled: {normal: s.disabled, hover: s.disabled, pressed: s.disabled, textColor: colorDisabledText},        
        delete: {normal: s.delete, hover: s.deleteHover, pressed: s.deletePressed, textColor: colorRed}
    }
    const {normal, hover, pressed, textColor} = styleMap[disabled ? 'disabled' : type] ?? styleMap.primary;
        
    return <HoverView disabled={disabled} role='button'
            style={[compact ? s.compactButton : s.button, normal]} hoverStyle={[s.hover, hover]} 
            pressedStyle={pressed} onPress={onPress} >
        {icon && <PadBox right={8}>{icon}</PadBox>}
        <UtilityText type='large' label={label} color={textColor} />
    </HoverView>
}

const CTAButtonStyle = StyleSheet.create({
    hover: {
    },
    primary: {
        backgroundColor: colorNearBlack,
        borderColor: colorNearBlack,
    },
    primaryHover: {
        backgroundColor: colorBlackHover,
        borderColor: colorBlackHover,
    },
    primaryPressed: {
        backgroundColor: colorPrimaryPress
    },
    secondary: {
        borderColor: colorGreyBorder,
        backgroundColor: colorWhite,
    },
    secondaryPressed: {
        backgroundColor: colorSecondaryPress,
    },
    secondaryHover: {
        backgroundColor: colorGreyHover,
        borderColor: colorGreyBorder
    },
    accent: {
        backgroundColor: colorAccent,
        borderColor: colorAccentHover
    },
    accentPressed: {
        backgroundColor: colorAccentPress,
    },
    accentHover: {
        backgroundColor: colorAccentHover,
        borderColor: colorAccentHover
    },
    delete: {
        // backgroundColor: colorPink,
        borderColor: colorGreyBorder,
    },
    deletePressed: {
        backgroundColor: colorSecondaryPress,
        borderColor: colorGreyBorder,
    },
    deleteHover: {
        backgroundColor: colorGreyHover,
        borderColor: colorGreyBorder
    },
    disabled: {
        backgroundColor: colorDisabledBackground,
        borderColor: colorDisabledBackground,
        color: colorDisabledText
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        flexDirection: 'row',
        height: 44, 
        alignItems: 'center',
    },
    compactButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1   
    }
})


export function IconButton({label, icon=null, wide=false, onPress}) {
    const s = IconReplyStyle;
    return <HoverView style={[s.button, wide ? s.wide : null]} hoverStyle={s.hover} 
            pressedStyle={s.pressed} onPress={onPress} role='button'>
        {icon && React.createElement(icon)} 
        {icon && label && <Pad size={8} />}
        <UtilityText label={label} />
    </HoverView>
}
const IconReplyStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        height: 32,
        alignItems: 'center',
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
        borderRadius: 8,
        // backgroundColor: colorGreyHover
    },
    wide: {
        alignSelf: 'stretch',
        justifyContent: 'center'
    },  
    hover: {
        backgroundColor: colorGreyBorder,
    },
    pressed: {
        backgroundColor: colorIconButtonPress
    }
});

export function SubtleButton({label, text, disabled, formatParams, color=colorTextGrey, strong=false, icon=null, padRight, onPress}) {
    const s = SubtleButtonStyle;
    const [hover, setHover] = useState(false);
    return <HoverView style={[s.button, padRight && {marginRight: 20}]} 
            disabled={disabled} role={!disabled ? 'button' : null}
            onPress={onPress} setHover={setHover}>
        {React.createElement(icon, {color})}
        {(label || text) && <Pad size={4} />}
        <UtilityText label={label} text={text} strong={strong} underline={hover} 
            color={color} formatParams={formatParams} type='tiny' />
    </HoverView>
}
const SubtleButtonStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});


export function TextButton({label, level=1, text, type='large', paragraph=false, editorial=false, underline, strong, italic, formatParams, leftIcon, rightIcon, color=colorBlack, onPress}) {
    const s = TextButtonStyle;
    const [hover, setHover] = useState(false);
    return <HoverView shrink style={s.button} setHover={setHover} onPress={onPress} role='button'>
        {leftIcon && React.createElement(leftIcon, {color})}
        {leftIcon && <Pad size={8} />}        
        {paragraph ? 
            <Paragraph label={label} text={text} formatParams={formatParams} type={type}
                color={color} underline={hover ^ underline} strong={strong} />
        : editorial ?
            <EditorialHeading level={level} label={label} text={text} formatParams={formatParams} type={type}
                color={color} underline={hover ^ underline} italic={italic} strong={strong} />
        :
            <UtilityText label={label} text={text} formatParams={formatParams} type={type} 
                color={color} underline={hover ^ underline} strong={strong} />
        }
        {rightIcon && <Pad size={8} />}
        {rightIcon && React.createElement(rightIcon, {color})}
    </HoverView>
}
const TextButtonStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})


export function ExpandButton({userList, photoUrlList, label, text, type='tiny', formatParams, expanded, setExpanded=()=>{}}) {
    const s = ExpanderButtonStyle;
    const [hover, setHover] = useState(false);

    return <HoverView style={s.button} setHover={setHover} role='button'
            onPress={() => setExpanded(!expanded)}>        
        {userList && <FacePile type={type} userIdList={userList} />}
        {photoUrlList && <PhotoPile photoUrlList={photoUrlList} />}
        {(userList || photoUrlList) && <Pad size={4} />}
        <UtilityText label={label} text={text} formatParams={formatParams} type={type} 
            underline={hover} strong />
        <Pad size={4} />
        {expanded ? <IconChevronUp /> : <IconChevronDown />}
    </HoverView>

}
const ExpanderButtonStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})

export function Tag({label, text, type='emphasized', formatParams, color=null, onPress}) {
    const s = TagStyle;
    return <View style={[
                s.button, 
                type == 'emphasized' && s.emphasized, 
                type == 'tiny' && s.tiny,      
                color && {borderColor: color, backgroundColor: color}
            ]} 
            hoverStyle={s.hover} onPress={onPress}>
        <UtilityText color={type=='tiny' ? colorTextBlue : null} label={label} text={text} formatParams={formatParams} strong type='tiny' />
    </View>
}
const TagStyle = StyleSheet.create({
    button: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderRadius: 4,
        // borderColor: 'red',
        borderColor: colorGreyBorder
    },
    emphasized: {
        borderRadius: 100,
    },
    tiny: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 100,
        backgroundColor: colorLightBlueBackground,
        borderColor: colorLightBlueBackground
    }
})

export function ReactionButton({label, count, selected}){
    const s = ReactionButtonStyle;
    const [pressed, setPressed] = useState(false);
    return <HoverView style={[s.button, selected && s.pressed]} hoverStyle={s.hover} 
            pressedStyle={s.pressed} setPressed={setPressed} role='button'>
        <UtilityText label={label} type='tiny' strong 
            color={(pressed || selected) ? colorTextBlue : colorBlack} />
        <Pad size={8} />
        <UtilityText text={count} type='tiny' strong color={colorRed} />
    </HoverView>
}
const ReactionButtonStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colorGreyBorder,
    },
    hover: {
        backgroundColor: colorGreyHover,
    },
    pressed: {
        borderColor: colorTextBlue,        
        backgroundColor: colorWhite
    }
})

export function DropDownSelector({label, options, value, onChange=()=>{}}) {
    const s = DropDownSelectorStyle;
    const [hover, setHover] = useState(false);
    const [shown, setShown] = useState(false);
    const selectedOption = options.find(o => o.key == value) || options[0];
    function popup() {
        return <View >
            {options.map((o, i) => <View key={i}>
                {i != 0 && <Pad size={20} />}
                <TextButton label={o.label} type='tiny' onPress={() => {onChange(o.key); closeActivePopup()}} />
            </View>)}
        </View>
    }
    return <View style={{alignSelf: 'flex-start'}}> 
        <Popup popupContent={popup} alignRight setHover={setHover} setShown={setShown}>
            <View style={s.button}>
                <UtilityText label={label} type='tiny' strong />
                <UtilityText text=': ' type='tiny' strong />
                <UtilityText label={selectedOption.label} type='tiny' underline={hover} strong />
                <Pad size={8} />
                {shown ? <IconChevronUpSmall /> : <IconChevronDownSmall />}
            </View>        
        </Popup>
    </View>
}

const DropDownSelectorStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
    }
})

export function Toggle({label, value, onChange}) {
    const s = ToggleStyle;
    return <HoverView style={s.outer} hoverStyle={s.hover}
            onPress={() => onChange(!value)} role='checkbox'>
        <UtilityText label={label} />
        <Pad size={12} />
        <View style={value ? s.toggleZoneSelected : s.toggleZone} onPress={() => onChange(!value)}>
            <View style={value ? s.toggleBallSelected : s.toggleBall} />
        </View>
    </HoverView>
}
const ToggleStyle = StyleSheet.create({
    outer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start'
    },
    toggleZone: {
        width: 56,
        height: 32,
        backgroundColor: colorGreyBorder,
        borderRadius: 100,
        transition: 'background-color 0.2s ease-in-out'
    },
    toggleBall: {
        boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.30)',
        // shadowOffset: { width: 2, height: 0 },
        // shadowOpacity: 0.50,
        // shadowRadius: 10,
        // shadowColor: 'rgba(0, 0, 0, 0.30)',
        elevation: 5,  // for Android,
        position: 'absolute',
        left: 2,
        top: 2,
        width: 28,
        height: 28,
        borderRadius: 100,
        backgroundColor: colorWhite,
        transition: 'left 0.2s ease-in-out, background-color 0.2s ease-in-out'
    },
    toggleZoneSelected: {
        width: 56,
        height: 32,
        backgroundColor: colorPurpleBackground,
        borderRadius: 100,
        transition: 'background-color 0.2s ease-in-out'
    },
    toggleBallSelected: {
        backgroundColor: colorAccent,
        left: 56-28-2,
        top: 2,
        width: 28,
        height: 28,
        borderRadius: 100,
        transition: 'left 0.2s ease-in-out, background-color 0.2s ease-in-out'
    },
    hover: {
        backgroundColor: colorGreyPopupBackground,
        borderTopRightRadius: 100,
        borderBottomRightRadius: 100,
    },
    pressed: {
        backgroundColor: colorGreyHover,
        borderTopRightRadius: 100,
        borderBottomRightRadius: 100,    
    }
})

export function BreadCrumb({icon, onPress}) {
    const s = BreadCrumbStyle;
    return <HoverView style={s.regular} hoverStyle={s.hover} 
        pressedStyle={s.pressed} onPress={onPress}>
        {React.createElement(icon)}
    </HoverView>
}

const BreadCrumbStyle = StyleSheet.create({
    regular: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hover: {
        backgroundColor: colorGreyHover
    },
    pressed: {
        backgroundColor: colorIconButtonPress
    }
})


export function PhotoPile({photoUrlList}) {
    const s = PhotoPileStyle;
    if (photoUrlList.length == 0) return null;
    if (photoUrlList.length == 1) {
        return <Image style={s.singlePhoto} source={{uri: photoUrlList[0]}} />
    } else if (photoUrlList.length == 2) {
        return <View style={s.outer}>
            <Image style={[s.twoPhoto, {left: 0, top: 0}]} source={{uri: photoUrlList[0]}} />
            <Image style={[s.twoPhoto, {right: 0, bottom: 0}]} source={{uri: photoUrlList[1]}} />
        </View>
    } else if (photoUrlList.length == 3) {
        return <View style={s.outer}>
            <Image style={[s.threePhoto, {left: 0, top: 0}]} source={{uri: photoUrlList[0]}} />
            <Image style={[s.threePhoto, {left: 6, top: 6}]} source={{uri: photoUrlList[1]}} />
            <Image style={[s.threePhoto, {right: 0, bottom: 0}]} source={{uri: photoUrlList[2]}} />
        </View>
    }
}
const PhotoPileStyle = StyleSheet.create({
    outer: {
        width: 32,
        height: 32
    },
    singlePhoto: {
        width: 32,
        height: 32,
        marginRight: 4
    },
    twoPhoto: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: colorWhite
    },
    threePhoto: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: colorWhite
    },
})