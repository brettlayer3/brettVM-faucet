import { 
    ConnectWallet, 
    Wallet, 
    WalletDropdown, 
    WalletDropdownLink, 
    WalletDropdownDisconnect, 
  } from '@coinbase/onchainkit/wallet'; 
  import {
    Address,
    Avatar,
    Name,
    Badge,
    Identity,
    EthBalance,
  } from '@coinbase/onchainkit/identity';
  import { color } from '@coinbase/onchainkit/theme';
   
  export function WalletComponents() {
    return (
      <div className="flex justify-end">
        <Wallet>
          <ConnectWallet>
            {/* <Avatar className="" />
            <Name /> */}
            <Address className={color.foregroundMuted} />
          </ConnectWallet>
          <WalletDropdown>
            {/* <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name>
                <Badge />
              </Name>
              <Address className={color.foregroundMuted} />
              <EthBalance />
            </Identity> */}
            <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
              Go to Wallet Dashboard
            </WalletDropdownLink>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>
    );
  }