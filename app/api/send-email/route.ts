import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, email, totalPrice, items, address } = body;

    const itemsListHtml = items
      .map(
        (item: any) =>
          `<p style="margin: 4px 0;">• ${item.title} (x${item.quantity}) - <b>${(Number(item.price) * item.quantity).toLocaleString()} ₮</b></p>`
      )
      .join('');

    const data = await resend.emails.send({
      from: 'Dalaishand Cargo <onboarding@resend.dev>',
      to: [email || 'delivered@resend.dev'],
      subject: 'Захиалга амжилттай баталгаажлаа! — DALAISHAND CARGO',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
          <h2 style="text-transform: uppercase; letter-spacing: 2px; font-size: 18px; text-align: center;">Захиалгын баталгаажуулалт</h2>
          <p>Сайн байна уу, <b>${customerName}</b>?</p>
          <p>Таны захиалгыг амжилттай хүлээн авлаа. Банкны данс руу шилжүүлэг хийснээр захиалга бүрэн баталгаажна.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Захиалсан бараанууд:</h3>
          ${itemsListHtml}
          
          <p style="margin-top: 20px;"><b>Хүргэх хаяг:</b> ${address}</p>
          <p style="font-size: 16px; margin-top: 10px;"><b>Нийт дүн:</b> ${Number(totalPrice).toLocaleString()} ₮</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666; text-align: center;">DALAISHAND CARGO-г сонгосонд баярлалаа!</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}