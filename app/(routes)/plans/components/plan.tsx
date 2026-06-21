"use client"

import { purchaseSubscription } from '@/app/_apis_routes/purchase';
import ButtonGroup from '@/app/components/buttonGroup';
import { BenefitsSchemaType } from '@/app/lib/database/interfaces/benefits.interface';
import { useAppDispatch } from '@/app/store';
import { activatePlan } from '@/app/store/actions/plan.actions';
import { formatBytes } from '@/app/utils/index.utils';
import { RazorpayClient } from '@/app/utils/razorpay/client';
import { useMutation } from '@tanstack/react-query';
import { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import style from '../style.module.scss';

type Props = {
    isPopular?: boolean;
    isActivated?: boolean;
    price: number;
    title: string;
    benefits: BenefitsSchemaType,
    description: string,
    isAuthenticated?: boolean,
    isFree: boolean;
    planId: string
    user?: User
    disabled?: boolean
}

const PlanCard = ({ price, title, description, benefits, isActivated, isPopular, isAuthenticated, isFree, planId, user, disabled }: Props) => {
    const { mutateAsync, isPending } = useMutation({ mutationFn: purchaseSubscription })
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleSubscription = async () => {

        if (isActivated) return;
        if (disabled) return
        if (!isAuthenticated) {
            router.push("/login")
            return
        }

        const { data } = await mutateAsync(planId);

        if (isFree) {
            dispatch(activatePlan(planId))
            return;
        }

        const response = data?.data;

        if (!response) throw new Error("Something went wrong!")

        const options = {
            "amount": String(response?.amount),
            "currency": "INR",
            "name": `${user?.firstName} ${user?.lastName}`,
            "description": "",
            "image": "https://mbox.diptabiswas.in/logo.png",
            "order_id": response?.razorpayOrderId,
            "callback_url": "",
            "prefill": {
                "name": `${user?.firstName} ${user?.lastName}`,
                "email": `${user?.email}`,
                "contact": ""
            },
            "notes": {
                ...response
            },
            "theme": {
                "color": "#6a29ff"
            },
            "handler": function (_: any) {
                // alert("Payment Success");
                // alert(`response.razorpay_payment_id ${response.razorpay_payment_id}`);
                // alert(`response.razorpay_order_id ${response.razorpay_order_id}`);
                // alert(`response.razorpay_signature ${response.razorpay_signature}`)
                dispatch(activatePlan(planId))
            }
        };

        const razorpayClient = new RazorpayClient(options).instance;
        razorpayClient.open()
        razorpayClient.on('payment.failed', function (_: any) {
            // console.log(`response.error.code ${response.error.code}`);
            // console.log(`response.error.description ${response.error.description}`);
            // console.log(`response.error.source ${response.error.source}`);
            // console.log(`response.error.step ${response.error.step}`);
            // console.log(`response.error.reason ${response.error.reason}`);
            // console.log(`response.error.metadata.order_id ${response.error.metadata.order_id}`);
            // console.log(`response.error.metadata.payment_id ${response.error.metadata.payment_id}`);
        })
    }


    return (
        <section className={`${style?.planCard} ${isPopular && style?.popular}`}>
            <h1>{title}</h1>
            <p><strong>&#8377; {price}</strong> /month</p>
            <span>{description}</span>
            {isPopular && <p className={style?.popular}>Popular</p>}

            <ul className={style?.benefits}>
                <li><strong>{benefits?.downloads}</strong> Downloads</li>
                <li><strong>{formatBytes(benefits?.maxSize)}</strong> Storage</li>
            </ul>

            <ul className={style?.description}>
                {benefits?.displayPoints?.map((benefit, index) => <li key={index}>{benefit}</li>)}
            </ul>

            <ButtonGroup
                className={`${style?.button} ${isActivated && isAuthenticated && style?.activated}`}
                submitText={isActivated && isAuthenticated ? "Activated" : isFree && isAuthenticated ? "Active" : isFree ? "Join" : "Go Premium"}
                handleSubmit={handleSubscription}
                loading={isPending}
                disabled={disabled}
            />
        </section>
    )
}

export default PlanCard