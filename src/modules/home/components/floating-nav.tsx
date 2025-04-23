"use client";
import { useEffect, useState } from "react";

import Navbar from "./acernity/floating-navabar";

export const FloatingNav = ({ navItems }: { navItems: { name: string; link: string }[] }) => {
    return (
        <>
            {/* // normal NAv */}
            {/* <NavbarDemo /> */}
            <Navbar />
        </>

    )
}