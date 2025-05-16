"use client";

import { getLocation } from '@/services/geolocation';
import { useEffect, useState } from "react"
import React from 'react'

export default function TestPage() {
    const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocationAndSetLoading = async () => {
      try {
        const res = await getLocation();
        console.log('取得した位置情報:', res);
      } catch (error) {
        console.error('位置情報の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationAndSetLoading();
  }, []);

    if (isLoading) {
        return (
            <div>Now Loading...</div>
        )
    } else {
        return (
            <div>Location: </div>
        )
    }
}
