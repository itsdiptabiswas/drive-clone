import { compare } from "bcryptjs"
import { extname } from "path"

export const MAX_CHUNK_COUNT = 5

const passwordTypes = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "abcdefghijklmnopqrstuvwxyz",
    "0123456789",
    "@$!%*?&]=^}"
]

export const comparePasswordWithHash = async (plainPassword: string, hashPassword: string) => {
    return await compare(plainPassword, hashPassword)
}


export const generatePassword = async (length: number = 8) => {
    let password: string = ""

    while (password.length <= length) {
        const pickIndex = Math.floor(Math.random() * passwordTypes.length)
        const str = passwordTypes[pickIndex]
        const pickOneChar = str.charAt(Math.floor(Math.random() * str.length))
        password = password + pickOneChar + "Mb0&"
    }

    return password
}

export const userInfoProjectionAggregationQuery = () => {
    return {
        $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            imageUrl: {
                $cond: {
                    if: { $and: [{ $gt: ["$imageUrl", null] }, { $gte: [{ $strLenCP: "$imageUrl" }, 1] }] },
                    then: { $concat: ["/api/users/image/", { $toString: "$_id" }] },
                    else: ""
                }
            }
        }
    }
}

export const normalizeFileName = (originalName: string): { baseName: string, ext: string } => {
    const ext = extname(originalName) || ""
    const baseRaw = ext ? originalName.slice(0, -ext.length) : originalName

    let base = baseRaw
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[\\/?%*:|"<>]/g, "-")

    if (!base) {
        base = "Untitled"
    }

    return {
        baseName: base,
        ext
    }
}

