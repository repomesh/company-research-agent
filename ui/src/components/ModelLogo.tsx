import { providerLogo, providerName } from '../models';

interface ModelLogoProps {
  provider: string;
  size?: number;
}

const ModelLogo = ({ provider, size = 28 }: ModelLogoProps) => {
  const logo = providerLogo(provider);
  return (
    <span className="model-logo" style={{ width: size, height: size }} title={providerName(provider)}>
      {logo ? (
        <img src={logo} alt="" width={size * 0.6} height={size * 0.6} />
      ) : (
        <span className="model-logo-letter" style={{ fontSize: size * 0.42 }}>
          {providerName(provider).charAt(0)}
        </span>
      )}
    </span>
  );
};

export default ModelLogo;
