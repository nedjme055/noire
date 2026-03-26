'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { formatDzd } from '@/lib/utils';

type CartPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    item: {
        title: string;
        image: string;
        size?: string;
        color?: string;
        priceDzd: number;
        quantity: number;
    } | null;
    locale: string;
};

export function CartPopup({ isOpen, onClose, item, locale }: CartPopupProps) {
    const t = useTranslations('product');
    const [isRendered, setIsRendered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let mountTimer: NodeJS.Timeout;
        let autoCloseTimer: NodeJS.Timeout;

        if (isOpen) {
            setIsRendered(true);
            mountTimer = setTimeout(() => setIsVisible(true), 10);
            autoCloseTimer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for transition out
            }, 5000);
        } else {
            setIsVisible(false);
            mountTimer = setTimeout(() => setIsRendered(false), 300);
        }

        return () => {
            clearTimeout(mountTimer);
            clearTimeout(autoCloseTimer);
        };
    }, [isOpen, onClose]);

    if (!isRendered || !item) return null;

    return (
        <div
            className={`fixed inset-x-0 bottom-4 z-[100] mx-auto w-[calc(100%-2rem)] max-w-sm sm:bottom-auto sm:right-6 sm:top-24 sm:mx-0 sm:w-96 transition-all duration-500 ease-out ${isVisible
                ? 'translate-y-0 opacity-100 sm:translate-x-0'
                : 'translate-y-8 opacity-0 sm:translate-y-0 sm:translate-x-8'
                }`}
        >
            <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-black/5 bg-[#faf9f8] px-4 py-3">
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-green-700">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </span>
                        {t('addedTitle')}
                    </p>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 bg-white">
                    <div className="flex gap-4">
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#f0ede8]">
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                            <div>
                                <h4 className="line-clamp-1 text-[14px] font-medium text-ink">{item.title}</h4>
                                <div className="mt-1 flex flex-wrap gap-1.5 text-[12px] text-black/50">
                                    {item.size && <span>{item.size}</span>}
                                    {item.size && item.color && <span>•</span>}
                                    {item.color && <span>{item.color}</span>}
                                    {(item.size || item.color) && <span>•</span>}
                                    <span>{t('quantity')}: {item.quantity}</span>
                                </div>
                            </div>
                            <p className="text-[13px] font-semibold">{formatDzd(item.priceDzd, locale)}</p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="flex h-11 items-center justify-center rounded-lg border border-black/15 bg-white text-[13px] font-medium transition-colors hover:border-black"
                        >
                            {t('continueShopping')}
                        </button>
                        <Link
                            href="/cart"
                            className="flex h-11 items-center justify-center rounded-lg bg-black text-[13px] font-medium text-white transition-opacity hover:opacity-80"
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                        >
                            {t('goToCart')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
