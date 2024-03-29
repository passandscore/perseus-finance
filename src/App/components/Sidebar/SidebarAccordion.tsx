// START: Import React and Dongles
import { useState, ReactNode, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// START: Import Local Files
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { IS_LOCAL_ENV } from '../../../ambient-utils/constants';
import { sidebarMethodsIF } from '../../hooks/useSidebar';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { FlexContainer, Text } from '../../../styled/Common';
import { AccordionHeader, ArrowIcon } from '../../../styled/Components/Sidebar';
import Button from '../../../components/Form/Button';
import { UserDataContext } from '../../../contexts/UserDataContext';

// interface for React functional component props
interface propsIF {
    children?: ReactNode;
    shouldDisplayContentWhenUserNotLoggedIn: boolean;
    isDefaultOverridden: boolean;
    item: {
        name: string;
        icon: ReactNode;
        data: ReactNode;
    };
    idx: number | string;
    openAllDefault?: boolean;
    sidebar: sidebarMethodsIF;
}

export default function SidebarAccordion(props: propsIF) {
    const {
        shouldDisplayContentWhenUserNotLoggedIn,
        idx,
        item,
        isDefaultOverridden,
        sidebar,
    } = props;

    const {
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);
    const { isUserConnected } = useContext(UserDataContext);
    const isTopPools = item.name === 'Top Pools';

    const [isOpen, setIsOpen] = useState(isTopPools);

    useEffect(() => {
        if (isTopPools) {
            IS_LOCAL_ENV && console.debug({ isOpen });
        }
    }, [isTopPools, isOpen]);
    const overflowSidebarMQ = useMediaQuery('(max-width: 1280px)');

    const openStateContent = (
        <motion.div
            key='content'
            initial='collapsed'
            animate='open'
            exit='collapsed'
            variants={{
                open: { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 1] }}
            style={{ overflow: 'hidden' }}
            onClick={overflowSidebarMQ ? () => sidebar.close() : undefined}
        >
            {item.data}
        </motion.div>
    );

    function handleAccordionClick() {
        if (sidebar.isOpen) {
            setIsOpen(!isOpen);
        } else {
            setIsOpen(true);
            sidebar.open();
        }
        IS_LOCAL_ENV && console.debug('clicked');
    }

    useEffect(() => {
        if (isDefaultOverridden) {
            if (props.openAllDefault) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        }
    }, [props.openAllDefault, isDefaultOverridden]);

    const accordionContentToShow =
        !isUserConnected &&
        !shouldDisplayContentWhenUserNotLoggedIn &&
        sidebar.isOpen ? (
            <motion.div
                key='content'
                initial='collapsed'
                animate='open'
                exit='collapsed'
                variants={{
                    open: { opacity: 1, height: 'auto' },
                    collapsed: { opacity: 0, height: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 1] }}
                style={{ overflow: 'hidden' }}
            >
                <FlexContainer
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                    fontSize='body'
                    gap={8}
                    padding='8px'
                    color='text2'
                >
                    <p>
                        Your recent {item.name.toLowerCase()} will display here.
                    </p>
                    <Button
                        idForDOM={`connect_wallet_button_in_sidebar_${item.name}`}
                        action={openWagmiModal}
                        flat
                        thin
                        title='Connect Wallet'
                    />
                </FlexContainer>
            </motion.div>
        ) : (
            sidebar.isOpen && openStateContent
        );

    // TODO: remove unnecessary wrapper inside `<AccordionHeader />`

    return (
        <FlexContainer
            flexDirection='column'
            style={{ flexShrink: '1', overflow: 'hidden' }}
        >
            <AccordionHeader
                key={idx}
                onClick={() => handleAccordionClick()}
                open={sidebar.isOpen}
            >
                <FlexContainer
                    id={`sidebar_header_${item.name
                        .replaceAll(' ', '_')
                        .toLowerCase()}`}
                    flexDirection='row'
                    alignItems='center'
                    justifyContent={!sidebar.isOpen ? 'center' : 'flex-start'}
                    gap={8}
                >
                    {sidebar.isOpen && <ArrowIcon size={12} open={isOpen} />}
                    {item.icon}
                    {sidebar.isOpen && (
                        <Text fontSize='body' fontWeight='500'>
                            {item.name}
                        </Text>
                    )}
                </FlexContainer>
            </AccordionHeader>
            <AnimatePresence>
                {isOpen && accordionContentToShow}
            </AnimatePresence>
        </FlexContainer>
    );
}
