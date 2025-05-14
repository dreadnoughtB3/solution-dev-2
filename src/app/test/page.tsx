"use client";

import { getLocation } from '@/services/geolocation';
import { useEffect } from "react"

import React from 'react'

export default function TestPage() {
    useEffect(() => {
        const loc = async() => {
            const res = await getLocation()
            console.log(res)
        }
        loc();
    },[])

    return (
        <div>TestPage</div>
    )
}
