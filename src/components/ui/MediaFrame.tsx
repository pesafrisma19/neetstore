import React from 'react';

export interface MediaFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  aspectRatio?: '1/1' | '16/9' | '4/3';
  sticker?: React.ReactNode;
}

export const MediaFrame: React.FC<MediaFrameProps> = ({
  src,
  alt = 'Media',
  aspectRatio = '16/9',
  sticker,
  children,
  className = '',
  ...props
}) => {
  const aspectStyles = {
    '1/1': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-4/3',
  };

  return (
    <div
      className={`relative border-[3px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] shadow-[5px_5px_0px_0px_var(--nb-shadow)] overflow-hidden ${aspectStyles[aspectRatio]} ${className}`}
      {...props}
    >
      {sticker && <div className="absolute top-2 right-2 z-10">{sticker}</div>}
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        children
      )}
    </div>
  );
};
