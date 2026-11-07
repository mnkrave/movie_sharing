import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  isEmailWhitelisted,
  findUserByEmail,
  createOrUpdateUser,
} from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Bitte fülle alle Felder aus." },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const whitelisted = await isEmailWhitelisted(emailLower);

    if (!whitelisted) {
      return NextResponse.json(
        {
          error:
            "Zugriff verweigert: Deine E-Mail ist noch nicht auf der Freundes-Whitelist. Lass dich von Lukas einladen!",
        },
        { status: 403 }
      );
    }

    const existing = await findUserByEmail(emailLower);
    if (existing && existing.password) {
      return NextResponse.json(
        { error: "Für diese E-Mail existiert bereits ein Account. Bitte logge dich ein." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createOrUpdateUser({
      email: emailLower,
      name: name.trim(),
      password: hashedPassword,
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registrierung fehlgeschlagen." },
      { status: 500 }
    );
  }
}
